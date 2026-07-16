import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  // These tests hit a real, shared Supabase project (auth signups, DB writes) —
  // running spec files across multiple workers hammers it with concurrent
  // operations and causes hangs/timeouts unrelated to the app itself.
  workers: 1,
  retries: 0,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'retain-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    // Serve a production build, not the dev server: Vite's dev server compiles
    // modules on demand per request, and on a cold CI runner (no warm esbuild
    // dependency-bundling cache) the very first page load can take well past
    // a test's timeout — every test failed on this, including ones with zero
    // backend interaction. A built + previewed app serves pre-compiled static
    // assets instantly, which is also closer to what actually ships anyway.
    command: 'npm run build && npm run preview -- --port 5173',
    url: 'http://localhost:5173',
    // Reusing a stale, already-running server (e.g. left over from manual
    // testing) silently serves stale env vars — never safe in CI, and only
    // worth the speed tradeoff locally.
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
