create policy "website_analyses_update_org"
  on public.website_analyses for update
  using (org_id in (select org_id from public.memberships where user_id = auth.uid()))
  with check (org_id in (select org_id from public.memberships where user_id = auth.uid()));
