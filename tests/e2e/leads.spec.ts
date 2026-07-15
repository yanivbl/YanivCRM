import { test, expect } from '@playwright/test';
import { register, uniqueEmail, TEST_PASSWORD } from './helpers';

test.describe.serial('lead CRUD', () => {
  const email = uniqueEmail('e2e-leads');
  const leadName = 'לקוח בדיקה אוטומטית';

  test.beforeAll(async ({ browser }) => {
    const page = await browser.newPage();
    await register(page, email);
    await page.close();
  });

  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', TEST_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/');
  });

  test('creates a lead with validation on the required name field', async ({ page }) => {
    await page.goto('/leads/new');
    await page.waitForSelector('input[name="name"]');

    // missing name is rejected
    await page.click('button:has-text("יצירה")');
    await expect(page.getByText('שם הליד הוא שדה חובה')).toBeVisible();

    await page.fill('input[name="name"]', leadName);
    await page.fill('input[name="company"]', 'חברת בדיקה');
    await page.click('button:has-text("יצירה")');

    await page.waitForURL('**/leads');
    // The desktop table and mobile card both render in the DOM at once (CSS
    // hides whichever doesn't match the viewport) — .first() picks either
    // consistently rather than hitting a strict-mode multi-match error.
    await expect(page.getByText(leadName).first()).toBeVisible();
  });

  test('finds the lead via search and status filter', async ({ page }) => {
    await page.goto('/leads');
    await page.fill('input[type="search"]', 'בדיקה אוטומטית');
    await expect(page.getByText(leadName).first()).toBeVisible();

    await page.selectOption('select[aria-label="סינון לפי סטטוס"]', 'new');
    await expect(page.getByText(leadName).first()).toBeVisible();

    await page.selectOption('select[aria-label="סינון לפי סטטוס"]', 'closed');
    await expect(page.getByText('לא נמצאו תוצאות')).toBeVisible();
  });

  test('edits the lead and reflects the change on the detail page', async ({ page }) => {
    await page.goto('/leads');
    await page.getByText(leadName).first().click();
    await page.waitForTimeout(500);

    await page.getByRole('link', { name: 'עריכה' }).click();
    await page.waitForSelector('input[name="price"]');
    await page.fill('input[name="price"]', '2500');
    await page.click('button:has-text("שמירה")');
    await page.waitForTimeout(500);

    await expect(page.getByText('₪2,500.00').or(page.getByText('2,500'))).toBeVisible();
  });

  test('deletes the lead', async ({ page }) => {
    await page.goto('/leads');
    await page.fill('input[type="search"]', 'בדיקה אוטומטית');
    await page.locator('table button:has-text("מחיקה")').click();
    await page.getByRole('button', { name: 'כן, מחק' }).click();
    // Wait for the confirm dialog itself to close — its own text also contains
    // the lead name, so asserting absence too early sees a stale extra match.
    await expect(page.getByText('האם אתה בטוח שברצונך למחוק')).not.toBeVisible();
    await expect(page.getByText(leadName)).not.toBeVisible();
  });
});
