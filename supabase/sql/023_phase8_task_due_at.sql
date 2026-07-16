-- Tasks need a specific due TIME, not just a date. Rename due_date -> due_at
-- and widen it to a full timestamp, matching the naming/type convention
-- already used everywhere else in this schema (starts_at, ends_at, etc.).
-- Existing date-only values become midnight UTC on that date, which is fine
-- since this feature only just shipped and has no meaningful prior time data.

alter table public.tasks rename column due_date to due_at;
alter table public.tasks alter column due_at type timestamptz using due_at::timestamptz;
alter index tasks_org_id_status_due_date_idx rename to tasks_org_id_status_due_at_idx;
