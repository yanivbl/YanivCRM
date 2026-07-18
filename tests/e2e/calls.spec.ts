import { test, expect } from '@playwright/test';
import { register, uniqueEmail } from './helpers';

test('log a call with all fields, see it in the history, then delete it', async ({ page }) => {
  const email = uniqueEmail('e2e-calls');
  const leadName = 'ליד לבדיקת שיחות';
  const summary = 'דיברנו על ההצעה, מעוניין להמשיך';
  // No transcript here on purpose: filling it now auto-triggers a real,
  // paid Claude analysis call (see the auto-analysis feature in
  // useLeadCalls.logCall) — this suite never exercises live third-party AI
  // calls, same policy as ai-analyze, so the transcript field is covered
  // only by its own unit-level behavior, not end-to-end here.
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
  await page.getByRole('button', { name: 'תיעוד שיחה', exact: true }).click();
  await expect(page.getByText('השיחה תועדה בהצלחה')).toBeVisible();

  const callRow = page.locator('li', { hasText: 'שיחה נכנסת' });
  await expect(callRow).toBeVisible({ timeout: 10000 });
  await expect(callRow).toContainText('10.7.2026');
  await expect(callRow).toContainText("12 דק'");
  await expect(callRow).toContainText(summary);

  await callRow.getByRole('button', { name: 'מחיקת שיחה' }).click();
  await page.getByRole('button', { name: 'כן, מחק' }).click();
  await expect(page.getByText('השיחה נמחקה')).toBeVisible();
  await expect(page.getByText('אין עדיין שיחות מתועדות')).toBeVisible();
});

// Doesn't exercise a real Whisper/Claude transcription — that's verified
// separately via a live, throwaway-data script, not on every CI run: it's a
// paid third-party API call, and this codebase already follows that pattern
// for ai-analyze (no e2e test covers a successful AI analysis there either).
// This covers what's actually safe and free to check on every push: the
// upload zone renders, and client-side file-type validation rejects a bad
// file before any network call happens.
test('audio upload zone appears on a logged call and rejects an unsupported file type', async ({ page }) => {
  const email = uniqueEmail('e2e-calls-upload');
  const leadName = 'ליד לבדיקת העלאת הקלטה';

  await register(page, email, 'משתמש בדיקת העלאה');
  await expect(page).toHaveURL(/\/$/);

  await page.goto('/leads/new');
  await page.waitForSelector('input[name="name"]');
  await page.fill('input[name="name"]', leadName);
  await page.click('button:has-text("יצירה")');
  await page.waitForURL('**/leads');

  await page.getByRole('link', { name: leadName }).click();
  await page.waitForURL('**/leads/*');

  await page.click('button:has-text("+ תיעוד שיחה")');
  await page.getByRole('button', { name: 'תיעוד שיחה', exact: true }).click();
  await expect(page.getByText('השיחה תועדה בהצלחה')).toBeVisible();

  await expect(page.getByText('גרירת קובץ הקלטה')).toBeVisible({ timeout: 10000 });

  await page.locator('input[type="file"]').setInputFiles({
    name: 'not-audio.txt',
    mimeType: 'text/plain',
    buffer: Buffer.from('this is not an audio file'),
  });
  await expect(page.getByText('פורמט לא נתמך')).toBeVisible();
});
