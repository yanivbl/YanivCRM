import { test, expect } from '@playwright/test';
import { register, uniqueEmail } from './helpers';

test('invite, role-change, and remove a teammate, and see it all in the activity feed', async ({ page }) => {
  const ownerEmail = uniqueEmail('e2e-team-owner');
  // mailinator.com has real MX records (unlike @example.com, which Supabase's
  // admin invite endpoint rejects as invalid) and is the standard disposable
  // domain for testing real invite-email flows without spamming a real inbox.
  const inviteeEmail = `e2e-team-invitee-${Date.now()}@mailinator.com`;

  await register(page, ownerEmail, 'בעל הארגון');
  await expect(page).toHaveURL(/\/$/);

  await page.locator('text=צוות').first().click();
  await page.waitForURL('**/team');
  await expect(page.locator('table')).toContainText('בעלים');
  await expect(page.locator('table tbody tr')).toHaveCount(1);

  // Invite a teammate
  await page.click('text=הזמנת חבר צוות');
  await page.fill('input[type="email"]', inviteeEmail);
  await page.locator('form select').selectOption('admin');
  await page.click('button:has-text("שלח הזמנה")');
  await expect(page.getByText('ההזמנה נשלחה בהצלחה')).toBeVisible({ timeout: 10000 });

  // inviteUserByEmail creates the membership immediately, before the invitee
  // ever clicks the email link, so the owner's list should update right away.
  await page.reload();
  await expect(page.locator('table tbody tr')).toHaveCount(2, { timeout: 10000 });
  await expect(page.locator('table')).toContainText(inviteeEmail);
  await expect(page.locator('table')).toContainText('מנהל');

  // Change their role
  const inviteeRow = page.locator('table tbody tr', { hasText: inviteeEmail });
  await inviteeRow.locator('select').selectOption('member');
  await expect(page.getByText('התפקיד עודכן')).toBeVisible({ timeout: 10000 });

  // Remove them
  await inviteeRow.locator('button:has-text("הסרה")').click();
  await page.click('button:has-text("כן, הסר")');
  await expect(page.getByText('חבר הצוות הוסר')).toBeVisible({ timeout: 10000 });
  await expect(page.locator('table tbody tr')).toHaveCount(1, { timeout: 10000 });

  // Every step above should be recorded in the org-wide activity feed
  await page.locator('text=פעילות').first().click();
  await page.waitForURL('**/activity');
  const activityFeed = page.locator('main');
  await expect(activityFeed).toContainText('הוזמן/ה', { timeout: 10000 });
  await expect(activityFeed).toContainText('הצטרף/ה לצוות');
  await expect(activityFeed).toContainText('התפקיד של');
  await expect(activityFeed).toContainText('הוסר/ה מהארגון');
});
