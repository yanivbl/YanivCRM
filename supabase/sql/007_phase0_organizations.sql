-- 1. organizations
create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

alter table public.organizations enable row level security;

-- 2. memberships
create table public.memberships (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'owner' check (role in ('owner','admin','member')),
  created_at timestamptz not null default now(),
  unique (org_id, user_id)
);

create index memberships_user_id_idx on public.memberships (user_id);
create index memberships_org_id_idx on public.memberships (org_id);

alter table public.memberships enable row level security;

create policy "memberships_select_own"
  on public.memberships for select
  using (user_id = auth.uid());

create policy "organizations_select_member"
  on public.organizations for select
  using (id in (select org_id from public.memberships where user_id = auth.uid()));

-- 3. alter leads: rename user_id -> owner_id, add org_id
alter table public.leads rename column user_id to owner_id;
alter table public.leads add column org_id uuid references public.organizations(id);

-- 4. backfill: one personal org + owner membership per existing profile
-- (a no-op on a fresh project with no existing profiles)
do $$
declare
  p record;
  new_org_id uuid;
begin
  for p in select id, full_name, email from public.profiles loop
    insert into public.organizations (name)
    values (coalesce(nullif(trim(p.full_name), ''), p.email) || '''s workspace')
    returning id into new_org_id;

    insert into public.memberships (org_id, user_id, role)
    values (new_org_id, p.id, 'owner');

    update public.leads set org_id = new_org_id where owner_id = p.id;
  end loop;
end $$;

-- 5. enforce not null + index
alter table public.leads alter column org_id set not null;
create index leads_org_id_idx on public.leads (org_id);

-- 6. replace RLS policies on leads (org-scoped instead of user-scoped)
drop policy if exists "leads_select_own" on public.leads;
drop policy if exists "leads_insert_own" on public.leads;
drop policy if exists "leads_update_own" on public.leads;
drop policy if exists "leads_delete_own" on public.leads;

create policy "leads_select_org"
  on public.leads for select
  using (org_id in (select org_id from public.memberships where user_id = auth.uid()));

create policy "leads_insert_org"
  on public.leads for insert
  with check (org_id in (select org_id from public.memberships where user_id = auth.uid()));

create policy "leads_update_org"
  on public.leads for update
  using (org_id in (select org_id from public.memberships where user_id = auth.uid()))
  with check (org_id in (select org_id from public.memberships where user_id = auth.uid()));

create policy "leads_delete_org"
  on public.leads for delete
  using (org_id in (select org_id from public.memberships where user_id = auth.uid()));

-- 7. extend handle_new_user to also create a personal org + owner membership
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  new_org_id uuid;
begin
  insert into public.profiles (id, full_name, email)
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    new.email
  );

  insert into public.organizations (name)
  values (coalesce(nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''), new.email) || '''s workspace')
  returning id into new_org_id;

  insert into public.memberships (org_id, user_id, role)
  values (new_org_id, new.id, 'owner');

  return new;
end;
$$;

-- 8. fix pre-existing security advisories
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

revoke execute on function public.handle_new_user() from anon, authenticated;
