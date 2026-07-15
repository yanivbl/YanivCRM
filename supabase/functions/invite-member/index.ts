import { createClient } from 'jsr:@supabase/supabase-js@2';
import { captureException } from '../_shared/sentry.ts';
import { corsHeaders, jsonResponse } from '../_shared/cors.ts';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const SENTRY_DSN = Deno.env.get('SENTRY_DSN');

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405);
  }

  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return jsonResponse({ error: 'Missing Authorization header' }, 401);
  }

  const callerClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: authHeader } },
  });

  const {
    data: { user },
  } = await callerClient.auth.getUser();
  if (!user) {
    return jsonResponse({ error: 'Invalid session' }, 401);
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return jsonResponse({ error: 'Invalid JSON' }, 400);
  }

  const email: string | undefined = typeof body.email === 'string' ? body.email.trim().toLowerCase() : undefined;
  const role: string | undefined = body.role;

  if (!email || !EMAIL_RE.test(email)) {
    return jsonResponse({ error: 'A valid email is required' }, 400);
  }
  if (role !== 'admin' && role !== 'member') {
    return jsonResponse({ error: 'Role must be admin or member' }, 400);
  }

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

  const { data: membership } = await admin
    .from('memberships')
    .select('org_id, role')
    .eq('user_id', user.id)
    .limit(1)
    .maybeSingle();

  if (!membership || (membership.role !== 'owner' && membership.role !== 'admin')) {
    return jsonResponse({ error: 'Only owners and admins can invite teammates' }, 403);
  }
  const orgId = membership.org_id;

  // memberships and profiles both reference auth.users independently (no direct FK
  // between them), so PostgREST can't embed one through the other — look up in two steps.
  const { data: existingProfile } = await admin.from('profiles').select('id').eq('email', email).maybeSingle();
  if (existingProfile) {
    const { data: existingMembership } = await admin
      .from('memberships')
      .select('id')
      .eq('org_id', orgId)
      .eq('user_id', existingProfile.id)
      .maybeSingle();
    if (existingMembership) {
      return jsonResponse({ error: 'This person is already a member of your organization' }, 409);
    }
  }

  const { error: inviteRowError } = await admin
    .from('invitations')
    .insert({ org_id: orgId, email, role, invited_by: user.id });
  if (inviteRowError) {
    if (inviteRowError.code === '23505') {
      return jsonResponse({ error: 'This email already has a pending invitation' }, 409);
    }
    return jsonResponse({ error: `Failed to create invitation: ${inviteRowError.message}` }, 500);
  }

  // Logged before sending: inviteUserByEmail creates the auth user (and fires the
  // member_joined trigger) synchronously as part of the call below, so logging
  // "invited" afterwards would always land after "joined" in the audit trail.
  // Best-effort: a failed audit-log write shouldn't fail an otherwise-successful invite.
  await admin
    .from('activity_log')
    .insert({ org_id: orgId, actor_id: user.id, action: 'member_invited', details: { email, role } });

  const { error: authInviteError } = await admin.auth.admin.inviteUserByEmail(email);
  if (authInviteError) {
    // Roll back the invitation row (and the activity log entry) so a failed send
    // doesn't block a future retry or leave a misleading audit entry.
    await admin.from('invitations').delete().eq('org_id', orgId).eq('email', email).is('accepted_at', null);
    await admin
      .from('activity_log')
      .delete()
      .eq('org_id', orgId)
      .eq('action', 'member_invited')
      .contains('details', { email });
    const message =
      authInviteError.message?.includes('already been registered') || authInviteError.code === 'email_exists'
        ? 'This email already has an account. They cannot currently be added to a second organization.'
        : `Failed to send invitation email: ${authInviteError.message}`;
    await captureException(SENTRY_DSN, `invite-member: ${authInviteError.message}`, { orgId, email });
    return jsonResponse({ error: message }, 400);
  }

  return jsonResponse({ ok: true }, 200);
});
