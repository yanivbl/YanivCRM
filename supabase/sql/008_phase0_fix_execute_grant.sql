-- create or replace function resets the default PUBLIC execute grant;
-- explicitly revoke it so handle_new_user is only invokable as the auth.users trigger.
revoke execute on function public.handle_new_user() from public;
grant execute on function public.handle_new_user() to postgres, service_role;
