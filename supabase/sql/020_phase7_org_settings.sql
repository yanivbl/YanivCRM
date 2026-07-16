-- Lets org admins update the organization row (name, cal_com_organizer_email)
-- from a settings page instead of only via direct SQL, which is how
-- cal_com_organizer_email has been set up until now.

create policy "organizations_update_admin"
  on public.organizations for update
  using (public.is_org_admin(id))
  with check (public.is_org_admin(id));
