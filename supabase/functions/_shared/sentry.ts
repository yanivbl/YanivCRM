// Minimal manual Sentry reporter using the envelope HTTP API directly.
// The official @sentry/deno SDK fails to boot in Supabase's Edge Runtime
// (it depends on Node internals the runtime doesn't provide), so this
// avoids the SDK entirely — same reasoning as hand-rolling HMAC verification
// instead of pulling in a crypto library.

function parseDsn(dsn: string) {
  const url = new URL(dsn);
  return { publicKey: url.username, host: url.host, projectId: url.pathname.replace(/^\//, '') };
}

export async function captureException(
  dsn: string | undefined,
  message: string,
  extra?: Record<string, unknown>
): Promise<void> {
  if (!dsn) return;
  try {
    const { publicKey, host, projectId } = parseDsn(dsn);
    const eventId = crypto.randomUUID().replace(/-/g, '');
    const envelopeHeader = JSON.stringify({ event_id: eventId, sent_at: new Date().toISOString() });
    const itemHeader = JSON.stringify({ type: 'event' });
    const event = JSON.stringify({
      event_id: eventId,
      timestamp: Date.now() / 1000,
      platform: 'other',
      level: 'error',
      logger: 'edge-function',
      message: { formatted: message },
      exception: { values: [{ type: 'Error', value: message }] },
      extra,
    });

    await fetch(`https://${host}/api/${projectId}/envelope/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-sentry-envelope',
        'X-Sentry-Auth': `Sentry sentry_version=7, sentry_client=edge-function/1.0, sentry_key=${publicKey}`,
      },
      body: `${envelopeHeader}\n${itemHeader}\n${event}\n`,
    });
  } catch {
    // Never let a Sentry reporting failure break the function's actual response.
  }
}
