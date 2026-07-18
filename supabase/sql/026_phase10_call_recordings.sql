-- Phase 10, Lesson 4: audio upload + Whisper transcription + automatic AI
-- analysis of calls.

alter table public.calls add column audio_url text;
alter table public.calls add column transcription_status text
  check (transcription_status is null or transcription_status in ('processing', 'done', 'failed'));
alter table public.calls add column ai_analysis jsonb;

-- Private bucket: call recordings can contain sensitive customer conversations.
-- Files are stored at {org_id}/{call_id}/{filename} — RLS below reads org_id
-- out of that path (the first folder segment) rather than needing a join,
-- since storage.objects has no direct FK to our tables.
insert into storage.buckets (id, name, public)
values ('call-recordings', 'call-recordings', false);

create policy "call_recordings_select_org"
  on storage.objects for select
  using (
    bucket_id = 'call-recordings'
    and (storage.foldername(name))[1]::uuid in (select org_id from public.memberships where user_id = auth.uid())
  );

create policy "call_recordings_insert_org"
  on storage.objects for insert
  with check (
    bucket_id = 'call-recordings'
    and (storage.foldername(name))[1]::uuid in (select org_id from public.memberships where user_id = auth.uid())
  );

create policy "call_recordings_delete_org"
  on storage.objects for delete
  using (
    bucket_id = 'call-recordings'
    and (storage.foldername(name))[1]::uuid in (select org_id from public.memberships where user_id = auth.uid())
  );
