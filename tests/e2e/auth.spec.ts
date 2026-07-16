import { test, expect } from '@playwright/test';
import { register, login, uniqueEmail, TEST_PASSWORD } from './helpers';

test.describe('authentication', () => {
  test('shows the public landing page at / when signed out, and redirects protected routes to /login', async ({
    page,
  }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByRole('link', { name: 'התחילו בחינם' })).toBeVisible();

    await page.goto('/leads');
    await page.waitForURL('**/login');
    await expect(page).toHaveURL(/\/login$/);
  });

  test('register -> logout -> login -> session persists across reload -> logout blocks direct access', async ({
    page,
  }) => {
    const email = uniqueEmail('e2e-auth');

    await register(page, email);
    await expect(page).toHaveURL(/\/$/);

    await page.getByRole('button', { name: 'התנתקות' }).click();
    await page.waitForURL('**/login');

    await login(page, email, TEST_PASSWORD);
    await expect(page).toHaveURL(/\/$/);

    await page.reload();
    await page.waitForTimeout(1000);
    await expect(page).toHaveURL(/\/$/);

    await page.getByRole('button', { name: 'התנתקות' }).click();
    await page.waitForURL('**/login');

    await page.goto('/leads');
    await page.waitForURL('**/login');
    await expect(page).toHaveURL(/\/login$/);
  });

  test('rejects login with the wrong password', async ({ page }) => {
    const email = uniqueEmail('e2e-auth-badpw');
    await register(page, email);
    await page.getByRole('button', { name: 'התנתקות' }).click();
    await page.waitForURL('**/login');

    await page.goto('/login');
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', 'WrongPassword1!');
    await page.click('button[type="submit"]');
    await expect(page.getByText('אימייל או סיסמה שגויים')).toBeVisible();
  });
});
