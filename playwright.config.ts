import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  // These tests hit a real, shared Supabase project (auth signups, DB writes) —
  // running spec files across multiple workers hammers it with concurrent
  // operations and causes hangs/timeouts unrelated to the app itself.
  workers: 1,
  retries: 0,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'retain-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    // Reusing a stale, already-running dev server (e.g. left over from manual
    // testing) silently serves stale env vars — never safe in CI, and only
    // worth the speed tradeoff locally.
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
  },
});
