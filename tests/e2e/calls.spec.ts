import { test, expect } from '@playwright/test';
import { register, uniqueEmail } from './helpers';

test('log a call with all fields, see it in the history, then delete it', async ({ page }) => {
  const email = uniqueEmail('e2e-calls');
  const leadName = 'ליד לבדיקת שיחות';
  const summary = 'דיברנו על ההצעה, מעוניין להמשיך';
  const nextSteps = 'לשלוח חוזה';

  await register(page, email, 'משתמש בדיקת שיחות');
  await expect(page).toHaveURL(/\/$/);

  await page.goto('/leads/new');
  await page.waitForSelector('input[name="name"]');
  await page.fill('input[name="name"]', leadName);
  await page.click('button:has-text("יצירה")');
  await page.waitForURL('**/leads');

  await page.getByRole('link', { name: leadName }).click();
  await page.waitForURL('**/leads/*');

  await page.click('button:has-text("+ תיעוד שיחה")');
  await page.selectOption('select[name="direction"]', 'incoming');
  await page.fill('input[name="called_at_date"]', '2026-07-10');
  await page.fill('input[name="called_at_time"]', '10:15');
  await page.fill('input[name="durationMinutes"]', '12');
  await page.fill('#call-summary', summary);
  await page.fill('input[name="nextSteps"]', nextSteps);
  await page.getByRole('button', { name: 'תיעוד שיחה', exact: true }).click();
  await expect(page.getByText('השיחה תועדה בהצלחה')).toBeVisible();

  const callRow = page.locator('li', { hasText: 'שיחה נכנסת' });
  await expect(callRow).toBeVisible({ timeout: 10000 });
  await expect(callRow).toContainText('10.7.2026');
  await expect(callRow).toContainText("12 דק'");
  await expect(callRow).toContainText(summary);
  await expect(callRow).toContainText(nextSteps);

  await callRow.getByRole('button', { name: 'מחיקת שיחה' }).click();
  await page.getByRole('button', { name: 'כן, מחק' }).click();
  await expect(page.getByText('השיחה נמחקה')).toBeVisible();
  await expect(page.getByText('אין עדיין שיחות מתועדות')).toBeVisible();
});
