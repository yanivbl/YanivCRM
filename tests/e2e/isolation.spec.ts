import { test, expect } from '@playwright/test';
import { register, uniqueEmail } from './helpers';

test('users in different organizations cannot see each other\'s leads', async ({ browser }) => {
  const emailA = uniqueEmail('e2e-iso-a');
  const emailB = uniqueEmail('e2e-iso-b');
  const leadAName = 'ליד ארגון א';
  const leadBName = 'ליד ארגון ב';

  const pageA = await browser.newPage();
  await register(pageA, emailA, 'משתמש ארגון א');
  await pageA.goto('/leads/new');
  await pageA.waitForSelector('input[name="name"]');
  await pageA.fill('input[name="name"]', leadAName);
  await pageA.click('button:has-text("יצירה")');
  await pageA.waitForURL('**/leads');

  const contextB = await browser.newContext();
  const pageB = await contextB.newPage();
  await register(pageB, emailB, 'משתמש ארגון ב');
  await pageB.goto('/leads/new');
  await pageB.waitForSelector('input[name="name"]');
  await pageB.fill('input[name="name"]', leadBName);
  await pageB.click('button:has-text("יצירה")');
  await pageB.waitForURL('**/leads');

  await pageB.waitForTimeout(500);
  await expect(pageB.getByText(leadBName)).toBeVisible();
  await expect(pageB.getByText(leadAName)).not.toBeVisible();

  await pageA.goto('/leads');
  await pageA.waitForTimeout(500);
  await expect(pageA.getByText(leadAName)).toBeVisible();
  await expect(pageA.getByText(leadBName)).not.toBeVisible();

  await pageA.close();
  await pageB.close();
  await contextB.close();
});
