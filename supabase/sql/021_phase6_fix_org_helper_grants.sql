-- is_org_member()/is_org_admin() (016_phase6_team_management.sql) never had
-- their execute grants locked down like the other SECURITY DEFINER functions
-- in this project (handle_new_user, log_lead_activity, log_membership_activity)
-- — caught by re-running the security advisor. They're currently callable by
-- anyone, including anon (unauthenticated) requests, directly via
-- /rest/v1/rpc/is_org_admin and /rest/v1/rpc/is_org_member.
--
-- authenticated must keep EXECUTE: RLS policies evaluate these functions as
-- the querying (authenticated) role, so revoking that would break every
-- policy that calls them. Only anon (and the default PUBLIC grant) is revoked.
revoke execute on function public.is_org_member(uuid) from public, anon;
grant execute on function public.is_org_member(uuid) to authenticated, postgres, service_role;

revoke execute on function public.is_org_admin(uuid) from public, anon;
grant execute on function public.is_org_admin(uuid) to authenticated, postgres, service_role;

-- Note: the advisor will still flag "authenticated_security_definer_function_executable"
-- for both — that's expected and unavoidable while these are used inside RLS
-- policies (Postgres requires EXECUTE for the querying role even when the
-- function call is implicit inside a USING clause). Calling either directly
-- as authenticated only reveals membership info the caller already has, so
-- this residual WARN is accepted rather than fixed further.
