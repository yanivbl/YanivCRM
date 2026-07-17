-- Phase 9, Lesson 2: manual call logging. Org-scoped like tasks/meetings —
-- any member of the org can see/manage any call in their org.

create table public.calls (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  lead_id uuid not null references public.leads(id) on delete cascade,
  direction text not null check (direction in ('incoming', 'outgoing')),
  duration_minutes integer check (duration_minutes is null or duration_minutes >= 0),
  summary text,
  next_steps text,
  called_at timestamptz not null default now(),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create index calls_org_id_idx on public.calls (org_id);
create index calls_lead_id_idx on public.calls (lead_id);
create index calls_org_id_created_by_called_at_idx on public.calls (org_id, created_by, called_at);

alter table public.calls enable row level security;

create policy "calls_select_org"
  on public.calls for select
  using (org_id in (select org_id from public.memberships where user_id = auth.uid()));

create policy "calls_insert_org"
  on public.calls for insert
  with check (org_id in (select org_id from public.memberships where user_id = auth.uid()));

create policy "calls_update_org"
  on public.calls for update
  using (org_id in (select org_id from public.memberships where user_id = auth.uid()))
  with check (org_id in (select org_id from public.memberships where user_id = auth.uid()));

create policy "calls_delete_org"
  on public.calls for delete
  using (org_id in (select org_id from public.memberships where user_id = auth.uid()));
