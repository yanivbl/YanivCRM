-- 1. organizer email routing
alter table public.organizations add column cal_com_organizer_email text unique;

-- 2. idempotency log for signed webhooks (source-agnostic, not just Cal.com)
create table public.webhook_events (
  id uuid primary key default gen_random_uuid(),
  source text not null,
  external_id text not null,
  payload jsonb not null,
  processed_at timestamptz,
  error text,
  created_at timestamptz not null default now(),
  unique (source, external_id)
);

-- no RLS policies: this table is only ever touched by the service-role key inside Edge Functions
alter table public.webhook_events enable row level security;

-- 3. lets a cancelled meeting revert the lead status it caused
alter table public.meetings add column previous_lead_status text;
