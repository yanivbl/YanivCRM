-- Deleting an organization cascades to its memberships, which fires
-- log_membership_activity()'s DELETE branch — but by then the organization
-- row is already gone, so the activity_log insert (which has its own FK to
-- organizations) violates that constraint and aborts the entire delete.
-- There's nothing meaningful to log against an org that's being torn down,
-- so swallow exactly that failure mode instead of blocking org deletion.

create or replace function public.log_membership_activity()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
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
    begin
      insert into public.activity_log (org_id, actor_id, action, details)
      values (old.org_id, auth.uid(), 'member_removed', jsonb_build_object('target_user_id', old.user_id, 'role', old.role));
    exception when foreign_key_violation then
      null;
    end;
    return old;
  end if;
  return coalesce(new, old);
end;
$$;
