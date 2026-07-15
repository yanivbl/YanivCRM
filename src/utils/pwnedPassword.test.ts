import { describe, it, expect, vi, afterEach } from 'vitest';
import { isPasswordPwned } from './pwnedPassword';

// SHA-1('password') = 5BAA61E4C9B93F3F0682250B6CF8331B7EE68FD8
const PASSWORD_SUFFIX = '1E4C9B93F3F0682250B6CF8331B7EE68FD8';

describe('isPasswordPwned', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('requests only the 5-character hash prefix, never the password itself', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, text: async () => '' });
    vi.stubGlobal('fetch', fetchMock);

    await isPasswordPwned('password');

    expect(fetchMock).toHaveBeenCalledWith('https://api.pwnedpasswords.com/range/5BAA6');
  });

  it('returns true when the suffix appears in the range response', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      text: async () => `0018A45C4D1DEF81644B54AB7F969B88D65:1\n${PASSWORD_SUFFIX}:3730471\n00D4F6E8FA6EECAD2A3AA415EEC418D38EC:2`,
    }));

    await expect(isPasswordPwned('password')).resolves.toBe(true);
  });

  it('returns false when the suffix is absent from the range response', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      text: async () => '0018A45C4D1DEF81644B54AB7F969B88D65:1\n00D4F6E8FA6EECAD2A3AA415EEC418D38EC:2',
    }));

    await expect(isPasswordPwned('a-genuinely-unique-passphrase-9f3k2')).resolves.toBe(false);
  });

  it('throws when the HIBP API is unavailable, letting the caller fail open', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 503 }));

    await expect(isPasswordPwned('password')).rejects.toThrow('HIBP request failed: 503');
  });
});
