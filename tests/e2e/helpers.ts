import type { Page } from '@playwright/test';

export function uniqueEmail(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}@example.com`;
}

// Not a memorable/common password: registration now checks passwords against
// HaveIBeenPwned client-side, and 'Test1234!'-style test passwords are
// themselves in real breach corpora, which would fail every e2e signup.
export const TEST_PASSWORD = 'Qz778xdbTMxVnHX!';

export async function register(page: Page, email: string, fullName = 'משתמש בדיקה') {
  await page.goto('/register');
  await page.waitForSelector('input[name="fullName"]');
  await page.fill('input[name="fullName"]', fullName);
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', TEST_PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForURL('**/');
}

export async function login(page: Page, email: string, password = TEST_PASSWORD) {
  await page.goto('/login');
  await page.waitForSelector('input[name="email"]');
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForURL('**/');
}
