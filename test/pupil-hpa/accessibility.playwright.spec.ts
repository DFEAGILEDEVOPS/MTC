import { test, expect } from '@playwright/test';

const pupilBaseUrl = process.env.PUPIL_BASE_URL ?? 'https://testpupil-as-mtc.azurewebsites.net';
const adminBaseUrl = process.env.ADMIN_BASE_URL ?? 'https://testadmin-as-mtc.azurewebsites.net';

test.describe('Accessibility pages', () => {
  test('pupil accessibility statement is available and exposed in accessibility tree', async ({ page }) => {
    await page.goto(`${pupilBaseUrl}/accessibility-statement`, { waitUntil: 'domcontentloaded' });

    await expect(page.getByRole('heading', { level: 1, name: /Accessibility statement/i })).toBeVisible();
    await expect(page.getByRole('main')).toBeVisible();
  });

  test('admin accessibility statement is available and exposed in accessibility tree', async ({ page }) => {
    await page.goto(`${adminBaseUrl}/accessibility-statement`, { waitUntil: 'domcontentloaded' });

    await expect(page.getByRole('heading', { level: 1, name: /Accessibility statement/i })).toBeVisible();
    await expect(page.getByRole('main')).toBeVisible();
  });
});