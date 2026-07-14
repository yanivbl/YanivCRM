import type { Page } from '@playwright/test';

export function uniqueEmail(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}@example.com`;
}

export const TEST_PASSWORD = 'Test1234!';

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
