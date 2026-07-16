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

  // The desktop table and mobile card both render in the DOM at once (CSS
  // hides whichever doesn't match the viewport) — .first() picks either
  // consistently rather than hitting a strict-mode multi-match error.
  // No fixed wait needed: toBeVisible() already polls until the list loads.
  await expect(pageB.getByText(leadBName).first()).toBeVisible();
  await expect(pageB.getByText(leadAName)).not.toBeVisible();

  await pageA.goto('/leads');
  await expect(pageA.getByText(leadAName).first()).toBeVisible();
  await expect(pageA.getByText(leadBName)).not.toBeVisible();

  await pageA.close();
  await pageB.close();
  await contextB.close();
});
