create table public.meetings (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  org_id uuid not null references public.organizations(id) on delete cascade,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  status text not null default 'scheduled'
    check (status in ('scheduled', 'completed', 'cancelled', 'no_show')),
  notes text,
  cal_com_booking_uid text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index meetings_lead_id_idx on public.meetings (lead_id);
create index meetings_org_id_idx on public.meetings (org_id);
create index meetings_starts_at_idx on public.meetings (starts_at);

alter table public.meetings enable row level security;

create policy "meetings_select_org"
  on public.meetings for select
  using (org_id in (select org_id from public.memberships where user_id = auth.uid()));

create policy "meetings_insert_org"
  on public.meetings for insert
  with check (org_id in (select org_id from public.memberships where user_id = auth.uid()));

create policy "meetings_update_org"
  on public.meetings for update
  using (org_id in (select org_id from public.memberships where user_id = auth.uid()))
  with check (org_id in (select org_id from public.memberships where user_id = auth.uid()));

create policy "meetings_delete_org"
  on public.meetings for delete
  using (org_id in (select org_id from public.memberships where user_id = auth.uid()));

create trigger meetings_set_updated_at
  before update on public.meetings
  for each row execute function public.set_updated_at();
