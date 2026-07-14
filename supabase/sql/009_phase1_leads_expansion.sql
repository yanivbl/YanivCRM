-- 1. drop the old status check constraint first
alter table public.leads drop constraint leads_status_check;

-- 2. migrate existing status values to the new 5-value model
update public.leads set status = 'contact_scheduled' where status = 'meeting_scheduled';
update public.leads set status = 'closed' where status = 'deal_closed';

-- 3. add the new status check constraint
alter table public.leads add constraint leads_status_check
  check (status in ('new', 'contact_scheduled', 'follow_up', 'closed', 'lost'));

-- 4. new lead fields
alter table public.leads add column company text;
alter table public.leads add column website_url text;
alter table public.leads add column source text not null default 'manual'
  check (source in ('manual', 'cal_com', 'website_form'));

-- 5. lead_notes table
create table public.lead_notes (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  author_id uuid not null references auth.users(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);

create index lead_notes_lead_id_idx on public.lead_notes (lead_id);

alter table public.lead_notes enable row level security;

create policy "lead_notes_select_org"
  on public.lead_notes for select
  using (
    lead_id in (
      select id from public.leads
      where org_id in (select org_id from public.memberships where user_id = auth.uid())
    )
  );

create policy "lead_notes_insert_org"
  on public.lead_notes for insert
  with check (
    author_id = auth.uid()
    and lead_id in (
      select id from public.leads
      where org_id in (select org_id from public.memberships where user_id = auth.uid())
    )
  );
