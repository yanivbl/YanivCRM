-- Extend the activity log to cover team membership changes, not just leads,
-- so the org-wide activity page is a genuine audit trail of the organization.

create or replace function public.log_membership_activity()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    -- Only invited members joining, not the founding owner row created alongside a new org.
    if new.role <> 'owner' then
      insert into public.activity_log (org_id, actor_id, action, details)
      values (new.org_id, new.user_id, 'member_joined', jsonb_build_object('role', new.role));
    end if;
    return new;
  elsif tg_op = 'UPDATE' and old.role is distinct from new.role then
    insert into public.activity_log (org_id, actor_id, action, details)
    values (
      new.org_id,
      auth.uid(),
      'member_role_changed',
      jsonb_build_object('target_user_id', new.user_id, 'from', old.role, 'to', new.role)
    );
    return new;
  elsif tg_op = 'DELETE' then
    insert into public.activity_log (org_id, actor_id, action, details)
    values (old.org_id, auth.uid(), 'member_removed', jsonb_build_object('target_user_id', old.user_id, 'role', old.role));
    return old;
  end if;
  return coalesce(new, old);
end;
$$;

revoke execute on function public.log_membership_activity() from public, anon, authenticated;

create trigger memberships_log_activity
  after insert or update or delete on public.memberships
  for each row execute function public.log_membership_activity();
