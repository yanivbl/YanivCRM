-- Same PUBLIC-grant reset issue as handle_new_user: revoke explicitly from
-- public, anon, and authenticated so only the trigger context can invoke this.
revoke execute on function public.log_lead_activity() from public, anon, authenticated;
grant execute on function public.log_lead_activity() to postgres, service_role;
