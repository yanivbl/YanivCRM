-- Phase 8, Lesson 1: tasks. Org-scoped like every other tenant-owned table —
-- any member of the org can see/manage any task in their org (filterable by
-- assignee in the UI), not restricted to the assignee alone.

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  lead_id uuid not null references public.leads(id) on delete cascade,
  title text not null,
  description text,
  status text not null default 'open' check (status in ('open', 'done')),
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high')),
  due_date date,
  assignee_id uuid references auth.users(id) on delete set null,
  created_by uuid references auth.users(id) on delete set null,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index tasks_org_id_idx on public.tasks (org_id);
create index tasks_lead_id_idx on public.tasks (lead_id);
create index tasks_assignee_id_idx on public.tasks (assignee_id);
create index tasks_org_id_status_due_date_idx on public.tasks (org_id, status, due_date);

alter table public.tasks enable row level security;

create policy "tasks_select_org"
  on public.tasks for select
  using (org_id in (select org_id from public.memberships where user_id = auth.uid()));

create policy "tasks_insert_org"
  on public.tasks for insert
  with check (org_id in (select org_id from public.memberships where user_id = auth.uid()));

create policy "tasks_update_org"
  on public.tasks for update
  using (org_id in (select org_id from public.memberships where user_id = auth.uid()))
  with check (org_id in (select org_id from public.memberships where user_id = auth.uid()));

create policy "tasks_delete_org"
  on public.tasks for delete
  using (org_id in (select org_id from public.memberships where user_id = auth.uid()));

create trigger tasks_set_updated_at
  before update on public.tasks
  for each row execute function public.set_updated_at();
