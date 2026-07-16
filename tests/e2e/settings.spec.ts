import { test, expect } from '@playwright/test';
import { register, uniqueEmail } from './helpers';

test('settings page: update profile name and Cal.com organizer email', async ({ page }) => {
  const email = uniqueEmail('e2e-settings');
  await register(page, email, 'שם ראשוני');
  await expect(page).toHaveURL(/\/$/);

  await page.locator('text=הגדרות').first().click();
  await page.waitForURL('**/settings');
  await expect(page.locator('h1')).toHaveText('הגדרות');

  await expect(page.locator('input[type="email"]').first()).toHaveValue(email);

  // Update full name — the only type="text" input on this page
  await page.fill('input[type="text"]', 'שם מעודכן');

  // The registering user is the org owner, so the Cal.com field is editable
  const organizerInput = page.locator('input[placeholder="organizer@example.com"]');
  await expect(organizerInput).toBeEnabled();
  await organizerInput.fill('organizer-test@example.com');

  await page.click('button:has-text("שמירה")');
  await expect(page.getByText('הפרטים נשמרו בהצלחה')).toBeVisible({ timeout: 10000 });

  await page.reload();
  await expect(page.locator('input[placeholder="organizer@example.com"]')).toHaveValue(
    'organizer-test@example.com'
  );

  // Full name is stored in both auth user_metadata (sidebar) and profiles
  // (team/activity pages) with no sync trigger between them — confirm both updated.
  await expect(page.locator('aside, header').first()).toContainText('שם מעודכן');

  await page.locator('text=צוות').first().click();
  await page.waitForURL('**/team');
  await expect(page.locator('table')).toContainText('שם מעודכן');
});
