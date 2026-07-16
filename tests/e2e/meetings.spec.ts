import { test, expect } from '@playwright/test';
import { register, uniqueEmail } from './helpers';

test('create and edit a meeting using the separate date/time fields', async ({ page }) => {
  const email = uniqueEmail('e2e-meetings');
  const leadName = 'ליד לבדיקת פגישות';

  await register(page, email, 'משתמש בדיקת פגישות');
  await expect(page).toHaveURL(/\/$/);

  await page.goto('/leads/new');
  await page.waitForSelector('input[name="name"]');
  await page.fill('input[name="name"]', leadName);
  await page.click('button:has-text("יצירה")');
  await page.waitForURL('**/leads');

  await page.getByRole('link', { name: leadName }).click();
  await page.waitForURL('**/leads/*');

  await page.click('button:has-text("+ פגישה חדשה")');
  await page.fill('input[name="starts_at_date"]', '2026-09-01');
  await page.fill('input[name="starts_at_time"]', '14:30');
  await page.click('button:has-text("יצירה")');
  await expect(page.getByText('הפגישה נוצרה בהצלחה')).toBeVisible();

  const meetingRow = page.locator('li', { hasText: 'מתוכננת' });
  await expect(meetingRow).toBeVisible({ timeout: 10000 });

  await meetingRow.getByRole('button', { name: 'עריכה' }).click();
  await expect(page.locator('input[name="starts_at_date"]')).toHaveValue('2026-09-01');
  await expect(page.locator('input[name="starts_at_time"]')).toHaveValue('14:30');
  await page.selectOption('select[name="status"]', 'completed');
  await page.click('button:has-text("שמירה")');
  await expect(page.getByText('הפגישה עודכנה בהצלחה')).toBeVisible();
  await expect(page.locator('li', { hasText: 'התקיימה' })).toBeVisible();
});
