// Browser-invoked functions (called via supabase-js from the app, not
// server-to-server like the Cal.com webhook) need explicit CORS headers —
// Supabase's Edge Runtime does not add them automatically, and a missing
// 'Access-Control-Allow-Origin' fails the browser's preflight before the
// function body ever runs, regardless of what the function itself returns.
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

export function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
