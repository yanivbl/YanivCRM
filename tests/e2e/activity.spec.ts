import { test, expect } from '@playwright/test';
import { register, uniqueEmail } from './helpers';

test('the org-wide activity page shows lead creation and status changes', async ({ page }) => {
  const email = uniqueEmail('e2e-activity');
  const leadName = 'ליד לבדיקת פעילות';

  await register(page, email, 'משתמש בדיקת פעילות');
  await expect(page).toHaveURL(/\/$/);

  await page.goto('/leads/new');
  await page.waitForSelector('input[name="name"]');
  await page.fill('input[name="name"]', leadName);
  await page.click('button:has-text("יצירה")');
  await page.waitForURL('**/leads');

  await page.selectOption('select[aria-label="שינוי סטטוס"]', 'contact_scheduled');
  await page.waitForTimeout(500);

  await page.locator('text=פעילות').first().click();
  await page.waitForURL('**/activity');
  await expect(page.locator('h1')).toHaveText('פעילות');

  const activityFeed = page.locator('main');
  await expect(activityFeed).toContainText('הליד נוצר', { timeout: 10000 });
  await expect(activityFeed).toContainText('הסטטוס שונה');
  // Both entries link back to the lead they belong to.
  await expect(activityFeed.getByRole('link', { name: leadName }).first()).toBeVisible();
});
