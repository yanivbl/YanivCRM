import { test, expect } from '@playwright/test';
import { register, uniqueEmail } from './helpers';

test('add a task on a lead, mark it done, and see it on the org-wide tasks page', async ({ page }) => {
  const email = uniqueEmail('e2e-tasks');
  const leadName = 'ליד לבדיקת משימות';
  const taskTitle = 'לחזור עם הצעת מחיר';

  await register(page, email, 'משתמש בדיקת משימות');
  await expect(page).toHaveURL(/\/$/);

  await page.goto('/leads/new');
  await page.waitForSelector('input[name="name"]');
  await page.fill('input[name="name"]', leadName);
  await page.click('button:has-text("יצירה")');
  await page.waitForURL('**/leads');

  await page.getByRole('link', { name: leadName }).click();
  await page.waitForURL('**/leads/*');

  await page.waitForSelector('text=משימות');
  await page.click('button:has-text("+ משימה חדשה")');
  await page.fill('input[name="title"]', taskTitle);
  await page.selectOption('select[name="priority"]', 'high');
  await page.click('button:has-text("הוספת משימה")');

  const taskRow = page.locator('li', { hasText: taskTitle });
  await expect(taskRow).toBeVisible({ timeout: 10000 });
  await expect(taskRow.locator('text=גבוהה')).toBeVisible();

  // The checkbox update is optimistic (UI reflects it immediately) while the
  // actual write is still in flight — navigating away too fast aborts that
  // in-flight request. Wait for the real PATCH response instead of a fixed
  // delay, which would need re-tuning for whatever machine runs this test.
  const updateResponse = page.waitForResponse(
    (res) => res.url().includes('/rest/v1/tasks') && res.request().method() === 'PATCH'
  );
  await taskRow.locator('input[type="checkbox"]').check();
  await expect(taskRow.locator('p', { hasText: taskTitle })).toHaveClass(/line-through/);
  await updateResponse;

  await page.goto('/tasks');
  await expect(page.locator('h1')).toHaveText('משימות');
  const tasksTableRow = page.locator('tr', { hasText: taskTitle });
  await expect(tasksTableRow).toBeVisible();
  await expect(tasksTableRow.getByRole('link', { name: leadName })).toBeVisible();

  await page.selectOption('select[aria-label="סינון לפי סטטוס"]', 'open');
  await expect(page.locator('tr', { hasText: taskTitle })).toHaveCount(0);

  await page.selectOption('select[aria-label="סינון לפי סטטוס"]', 'done');
  await expect(page.locator('tr', { hasText: taskTitle })).toBeVisible();
});

test('add a task with a due date and see it reflected on the lead', async ({ page }) => {
  const email = uniqueEmail('e2e-tasks-duedate');
  const leadName = 'ליד לבדיקת תאריך יעד';
  const taskTitle = 'שיחת מעקב';
  const dueDate = '2026-08-01';

  await register(page, email, 'משתמש בדיקת תאריך');
  await expect(page).toHaveURL(/\/$/);

  await page.goto('/leads/new');
  await page.waitForSelector('input[name="name"]');
  await page.fill('input[name="name"]', leadName);
  await page.click('button:has-text("יצירה")');
  await page.waitForURL('**/leads');

  await page.getByRole('link', { name: leadName }).click();
  await page.waitForURL('**/leads/*');
  await page.waitForSelector('text=משימות');
  await page.click('button:has-text("+ משימה חדשה")');
  await expect(page.getByRole('heading', { name: `משימה חדשה עבור ${leadName}` })).toBeVisible();
  await page.fill('input[name="title"]', taskTitle);
  await page.fill('input[name="dueDate"]', dueDate);
  await page.click('button:has-text("הוספת משימה")');
  await expect(page.getByRole('heading', { name: `משימה חדשה עבור ${leadName}` })).not.toBeVisible();

  const taskRow = page.locator('li', { hasText: taskTitle });
  await expect(taskRow).toBeVisible({ timeout: 10000 });
  await expect(taskRow).toContainText('1.8.2026');
});
