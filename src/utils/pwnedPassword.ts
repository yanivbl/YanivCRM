// Supabase's built-in leaked-password check (HaveIBeenPwned) requires a Pro
// plan. This replicates the same check client-side using HIBP's free,
// keyless Pwned Passwords k-anonymity API: only the first 5 hex characters
// of the SHA-1 hash are ever sent, so the actual password never leaves the
// browser. This can't be enforced server-side on the free plan (Supabase
// only exposes the equivalent Password Verification hook on Teams/Enterprise),
// so it protects real registrations through the UI, not direct API calls.
async function sha1Hex(text: string): Promise<string> {
  const bytes = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest('SHA-1', bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
    .toUpperCase();
}

export async function isPasswordPwned(password: string): Promise<boolean> {
  const hash = await sha1Hex(password);
  const prefix = hash.slice(0, 5);
  const suffix = hash.slice(5);

  const res = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`);
  if (!res.ok) throw new Error(`HIBP request failed: ${res.status}`);

  const body = await res.text();
  return body
    .split('\n')
    .some((line) => line.split(':')[0].trim() === suffix);
}
