-- Phase 6: team management (invitations, roles) + org-scoped webhook rate limiting

-- 1. helper functions to avoid recursive RLS on memberships
create or replace function public.is_org_member(check_org_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.memberships
    where org_id = check_org_id and user_id = auth.uid()
  );
$$;

create or replace function public.is_org_admin(check_org_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.memberships
    where org_id = check_org_id and user_id = auth.uid() and role in ('owner', 'admin')
  );
$$;

-- 2. memberships: replace self-only select with org-wide select (needed for the team list)
drop policy if exists "memberships_select_own" on public.memberships;

create policy "memberships_select_org"
  on public.memberships for select
  using (public.is_org_member(org_id));

create policy "memberships_update_admin"
  on public.memberships for update
  using (public.is_org_admin(org_id))
  with check (public.is_org_admin(org_id));

create policy "memberships_delete_admin"
  on public.memberships for delete
  using (public.is_org_admin(org_id));

-- 3. protect the owner role: only an owner can grant/revoke it, and an org always keeps >=1 owner
create or replace function public.protect_memberships()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  owner_count int;
  caller_role text;
begin
  select role into caller_role
  from public.memberships
  where org_id = coalesce(new.org_id, old.org_id) and user_id = auth.uid();

  if tg_op = 'DELETE' then
    if old.role = 'owner' then
      select count(*) into owner_count from public.memberships where org_id = old.org_id and role = 'owner';
      if owner_count <= 1 then
        raise exception 'Cannot remove the last owner of an organization';
      end if;
    end if;
    return old;
  end if;

  if tg_op = 'UPDATE' then
    if (old.role = 'owner' or new.role = 'owner') and coalesce(caller_role, '') <> 'owner' then
      raise exception 'Only an owner can grant or revoke the owner role';
    end if;
    if old.role = 'owner' and new.role <> 'owner' then
      select count(*) into owner_count from public.memberships where org_id = old.org_id and role = 'owner';
      if owner_count <= 1 then
        raise exception 'Cannot demote the last owner of an organization';
      end if;
    end if;
    return new;
  end if;

  return new;
end;
$$;

revoke execute on function public.protect_memberships() from public;

create trigger memberships_protect
  before update or delete on public.memberships
  for each row execute function public.protect_memberships();

-- 4. invitations
create table public.invitations (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  email text not null,
  role text not null check (role in ('admin', 'member')),
  invited_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  accepted_at timestamptz
);

create unique index invitations_pending_unique
  on public.invitations (org_id, lower(email))
  where accepted_at is null;

create index invitations_email_idx on public.invitations (lower(email));

alter table public.invitations enable row level security;

create policy "invitations_select_admin"
  on public.invitations for select
  using (public.is_org_admin(org_id));

create policy "invitations_delete_admin"
  on public.invitations for delete
  using (public.is_org_admin(org_id));

-- (no insert/update policy: invitations are only ever created by the invite-member
-- edge function via the service role key, which also re-validates the caller is an admin)

-- 5. handle_new_user: join a pending invitation's org instead of creating a personal org
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  new_org_id uuid;
  pending_invite record;
begin
  insert into public.profiles (id, full_name, email)
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    new.email
  );

  select * into pending_invite
  from public.invitations
  where lower(email) = lower(new.email) and accepted_at is null
  order by created_at asc
  limit 1;

  if pending_invite.id is not null then
    insert into public.memberships (org_id, user_id, role)
    values (pending_invite.org_id, new.id, pending_invite.role);

    update public.invitations set accepted_at = now() where id = pending_invite.id;
  else
    insert into public.organizations (name)
    values (coalesce(nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''), new.email) || '''s workspace')
    returning id into new_org_id;

    insert into public.memberships (org_id, user_id, role)
    values (new_org_id, new.id, 'owner');
  end if;

  return new;
end;
$$;

-- 6. cal-webhook rate limiting: capture organizer email at insert time so the
-- function can cheaply count recent events per organizer without a join.
alter table public.webhook_events add column organizer_email text;
create index webhook_events_organizer_email_created_at_idx
  on public.webhook_events (organizer_email, created_at);
