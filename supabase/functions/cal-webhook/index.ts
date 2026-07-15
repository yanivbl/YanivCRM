import { createClient } from 'jsr:@supabase/supabase-js@2';
import { captureException } from '../_shared/sentry.ts';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const CAL_COM_WEBHOOK_SECRET = Deno.env.get('CAL_COM_WEBHOOK_SECRET')!;
const SENTRY_DSN = Deno.env.get('SENTRY_DSN');

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

const ACTIVE_LEAD_STATUSES = new Set(['new', 'contact_scheduled', 'follow_up']);
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_EVENTS = 60;

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}

async function verifySignature(rawBody: string, signature: string | null, secret: string): Promise<boolean> {
  if (!signature) return false;
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sigBuffer = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(rawBody));
  const computed = Array.from(new Uint8Array(sigBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  const provided = signature.replace(/^sha256=/, '');
  return timingSafeEqual(computed, provided);
}

Deno.serve(async (req: Request) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  const rawBody = await req.text();
  const signature = req.headers.get('x-cal-signature-256');

  if (!(await verifySignature(rawBody, signature, CAL_COM_WEBHOOK_SECRET))) {
    return new Response(JSON.stringify({ error: 'Invalid signature' }), { status: 401 });
  }

  let body: any;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400 });
  }

  const triggerEvent: string | undefined = body.triggerEvent;
  const booking = body.payload;

  if (!triggerEvent || !booking?.uid) {
    // Malformed but signed payload: acknowledge so Cal.com doesn't retry, nothing to process.
    return new Response(JSON.stringify({ ok: false, error: 'Missing triggerEvent or booking uid' }), {
      status: 200,
    });
  }

  const externalId = `${triggerEvent}:${booking.uid}`;
  const organizerEmailForLimit: string | undefined = booking.organizer?.email?.toLowerCase();

  // Rate limit per organizer, not globally: protects against a misbehaving/looping
  // Cal.com integration hammering the DB, without punishing other organizers sharing this endpoint.
  if (organizerEmailForLimit) {
    const windowStart = new Date(Date.now() - RATE_LIMIT_WINDOW_MS).toISOString();
    const { count: recentCount } = await supabase
      .from('webhook_events')
      .select('id', { count: 'exact', head: true })
      .eq('organizer_email', organizerEmailForLimit)
      .gte('created_at', windowStart);
    if ((recentCount ?? 0) >= RATE_LIMIT_MAX_EVENTS) {
      return new Response(JSON.stringify({ ok: false, error: 'Rate limit exceeded' }), { status: 200 });
    }
  }

  // Idempotency guard: unique(source, external_id) rejects a replayed delivery.
  const { data: insertedEvent, error: eventInsertError } = await supabase
    .from('webhook_events')
    .insert({ source: 'cal.com', external_id: externalId, payload: body, organizer_email: organizerEmailForLimit })
    .select('id')
    .single();

  if (eventInsertError) {
    // Unique violation (or any insert failure) is treated as "already processed" per Cal.com's own retry semantics.
    return new Response(JSON.stringify({ ok: true, duplicate: true }), { status: 200 });
  }

  const webhookEventId = insertedEvent.id;

  try {
    const organizerEmail: string | undefined = booking.organizer?.email?.toLowerCase();
    if (!organizerEmail) throw new Error('Webhook payload missing organizer email');

    const { data: org } = await supabase
      .from('organizations')
      .select('id')
      .eq('cal_com_organizer_email', organizerEmail)
      .maybeSingle();
    if (!org) throw new Error(`No organization mapped to organizer email ${organizerEmail}`);

    const { data: ownerMembership } = await supabase
      .from('memberships')
      .select('user_id')
      .eq('org_id', org.id)
      .eq('role', 'owner')
      .limit(1)
      .maybeSingle();
    if (!ownerMembership) throw new Error(`Organization ${org.id} has no owner membership`);

    const attendee = booking.attendees?.[0];
    if (!attendee?.email) throw new Error('Webhook payload missing attendee email');
    const attendeeEmail = attendee.email.toLowerCase();

    let { data: lead } = await supabase
      .from('leads')
      .select('*')
      .eq('org_id', org.id)
      .eq('email', attendeeEmail)
      .maybeSingle();

    const previousLeadStatus: string | null = lead?.status ?? null;

    if (!lead) {
      const { data: newLead, error: leadInsertError } = await supabase
        .from('leads')
        .insert({
          org_id: org.id,
          owner_id: ownerMembership.user_id,
          name: attendee.name || attendeeEmail,
          email: attendeeEmail,
          status: 'contact_scheduled',
          source: 'cal_com',
        })
        .select('*')
        .single();
      if (leadInsertError) throw new Error(`Failed to create lead: ${leadInsertError.message}`);
      lead = newLead;
    } else if (
      (triggerEvent === 'BOOKING_CREATED' || triggerEvent === 'BOOKING_RESCHEDULED') &&
      ACTIVE_LEAD_STATUSES.has(lead.status)
    ) {
      const { count: completedCount } = await supabase
        .from('meetings')
        .select('id', { count: 'exact', head: true })
        .eq('lead_id', lead.id)
        .eq('status', 'completed');

      const nextStatus = (completedCount ?? 0) > 0 ? 'follow_up' : 'contact_scheduled';
      if (nextStatus !== lead.status) {
        await supabase.from('leads').update({ status: nextStatus }).eq('id', lead.id);
        lead.status = nextStatus;
      }
    }

    const meetingStatus = triggerEvent === 'BOOKING_CANCELLED' ? 'cancelled' : 'scheduled';

    const { data: existingMeeting } = await supabase
      .from('meetings')
      .select('id')
      .eq('cal_com_booking_uid', booking.uid)
      .maybeSingle();

    if (existingMeeting) {
      await supabase
        .from('meetings')
        .update({
          starts_at: booking.startTime,
          ends_at: booking.endTime,
          status: meetingStatus,
        })
        .eq('id', existingMeeting.id);
    } else {
      await supabase.from('meetings').insert({
        lead_id: lead.id,
        org_id: org.id,
        starts_at: booking.startTime,
        ends_at: booking.endTime,
        status: meetingStatus,
        cal_com_booking_uid: booking.uid,
        previous_lead_status: previousLeadStatus,
      });
    }

    if (triggerEvent === 'BOOKING_CANCELLED') {
      const { count: otherScheduledCount } = await supabase
        .from('meetings')
        .select('id', { count: 'exact', head: true })
        .eq('lead_id', lead.id)
        .eq('status', 'scheduled')
        .neq('cal_com_booking_uid', booking.uid);

      const { data: cancelledMeeting } = await supabase
        .from('meetings')
        .select('previous_lead_status')
        .eq('cal_com_booking_uid', booking.uid)
        .maybeSingle();

      if (
        (otherScheduledCount ?? 0) === 0 &&
        cancelledMeeting?.previous_lead_status &&
        ACTIVE_LEAD_STATUSES.has(lead.status)
      ) {
        await supabase
          .from('leads')
          .update({ status: cancelledMeeting.previous_lead_status })
          .eq('id', lead.id);
      }
    }

    await supabase.from('webhook_events').update({ processed_at: new Date().toISOString() }).eq('id', webhookEventId);

    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await supabase
      .from('webhook_events')
      .update({ error: message.slice(0, 1000) })
      .eq('id', webhookEventId);
    await captureException(SENTRY_DSN, `cal-webhook: ${message}`, { triggerEvent, webhookEventId });

    // Always 200 on business-logic failures so Cal.com doesn't retry forever on an unmapped/malformed payload.
    return new Response(JSON.stringify({ ok: false, error: message }), { status: 200 });
  }
});
