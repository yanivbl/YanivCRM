create table public.website_analyses (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references public.leads(id) on delete cascade,
  org_id uuid not null references public.organizations(id) on delete cascade,
  url text not null,
  status text not null default 'queued'
    check (status in ('queued', 'running', 'done', 'failed')),
  business_summary text,
  issues jsonb,
  opportunities jsonb,
  recommended_services jsonb,
  next_steps jsonb,
  error_message text,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create index website_analyses_lead_id_idx on public.website_analyses (lead_id);
create index website_analyses_org_id_idx on public.website_analyses (org_id);

alter table public.website_analyses enable row level security;

create policy "website_analyses_select_org"
  on public.website_analyses for select
  using (org_id in (select org_id from public.memberships where user_id = auth.uid()));

create policy "website_analyses_insert_org"
  on public.website_analyses for insert
  with check (org_id in (select org_id from public.memberships where user_id = auth.uid()));

create policy "website_analyses_delete_org"
  on public.website_analyses for delete
  using (org_id in (select org_id from public.memberships where user_id = auth.uid()));
