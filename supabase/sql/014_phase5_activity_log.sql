create table public.activity_log (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  lead_id uuid references public.leads(id) on delete cascade,
  actor_id uuid references auth.users(id) on delete set null,
  action text not null,
  details jsonb,
  created_at timestamptz not null default now()
);

create index activity_log_org_id_idx on public.activity_log (org_id);
create index activity_log_lead_id_idx on public.activity_log (lead_id);

alter table public.activity_log enable row level security;

create policy "activity_log_select_org"
  on public.activity_log for select
  using (org_id in (select org_id from public.memberships where user_id = auth.uid()));

create or replace function public.log_lead_activity()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    insert into public.activity_log (org_id, lead_id, actor_id, action, details)
    values (new.org_id, new.id, auth.uid(), 'lead_created', jsonb_build_object('status', new.status, 'source', new.source));
  elsif tg_op = 'UPDATE' and new.status is distinct from old.status then
    insert into public.activity_log (org_id, lead_id, actor_id, action, details)
    values (new.org_id, new.id, auth.uid(), 'status_changed', jsonb_build_object('from', old.status, 'to', new.status));
  end if;
  return new;
end;
$$;

revoke execute on function public.log_lead_activity() from public;

create trigger leads_log_activity
  after insert or update on public.leads
  for each row execute function public.log_lead_activity();
