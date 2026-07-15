-- profiles RLS was still self-only from the original single-user build
-- (003_rls_profiles.sql). The Team page needs to show teammates' names and
-- emails, but the owner's query for other members' profiles was silently
-- returning zero rows under RLS — not an error, just an empty result, which
-- is why it went unnoticed until actually looking at the rendered table.
-- Multiple SELECT policies on the same table are OR'd together, so this
-- adds org-mate visibility without touching the existing self-access policy.

create policy "profiles_select_org_mates"
  on public.profiles for select
  using (
    exists (
      select 1
      from public.memberships m1
      join public.memberships m2 on m1.org_id = m2.org_id
      where m1.user_id = auth.uid() and m2.user_id = profiles.id
    )
  );
