import { test, expect } from '@playwright/test';
import { loginAsSuperuser, requiredEnvironmentVariable } from './superuser-test.helpers';

test.describe('Superuser homepage and impersonation', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test.beforeEach(async ({ page }) => {
    await loginAsSuperuser(page);
  });

  test('shows the expected homepage links and keeps Home on the superuser homepage', async ({ page }) => {
    const links = [
      ['Impersonate a school', '/helpdesk/school-impersonation'],
      ['Service message', '/service-message'],
      ['Search organisations', '/service-manager/organisations/search'],
      ['Pupil search', '/service-manager/pupil-search'],
    ];
    for (const [name, href] of links) {
      const link = page.getByRole('link', { name, exact: true });
      await expect(link).toBeVisible();
      await expect(link).toHaveAttribute('href', href);
    }
    await expect(page.getByText('Add or delete a global service message for the school homepage', { exact: true })).toBeVisible();
    await expect(page.getByText('Administer Pupils', { exact: true })).toBeVisible();

    await page.getByRole('link', { name: 'Impersonate a school', exact: true }).click();
    await expect(page).toHaveURL(/\/helpdesk\/school-impersonation$/);
    await page.locator('.govuk-breadcrumbs').getByRole('link', { name: 'Home', exact: true }).click();
    await expect(page).toHaveURL(/\/superuser$/);
    await expect(page.getByRole('heading', { name: 'MTC Superuser', exact: true })).toBeVisible();
  });

  test('signing out prevents access to the superuser homepage', async ({ page }) => {
    await page.getByRole('link', { name: 'Sign out', exact: true }).click();
    await page.goto('/superuser');
    await expect(page).toHaveURL(/\/sign-in$/);
    await expect(page.getByRole('textbox', { name: 'Enter your user name.', exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'MTC Superuser', exact: true })).toHaveCount(0);
  });

  test('Home respects school impersonation and returns to superuser after removal', async ({ page }) => {
    const dfeNumber = requiredEnvironmentVariable('SUPERUSER_SCHOOL_DFE_NUMBER');
    await page.getByRole('link', { name: 'Impersonate a school', exact: true }).click();
    await page.locator('#dfeNumber').fill(dfeNumber);
    await page.getByRole('button', { name: 'Submit', exact: true }).click();
    await expect(page).toHaveURL(/\/school\/school-home$/);
    const identity = page.locator('.signed-in-as');
    await expect(identity).toContainText(`DfE# ${dfeNumber}`);
    const schoolName = await identity.locator('strong').first().innerText();
    expect(schoolName.trim()).not.toBe('');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(`Manage the multiplication tables check for ${schoolName}`);

    await page.getByRole('link', { name: 'View, add or edit pupils on your register', exact: true }).click();
    await expect(page).toHaveURL(/\/pupil-register\/pupils-list$/);
    await expect(identity).toContainText(`DfE# ${dfeNumber}`);
    await page.locator('.govuk-breadcrumbs').getByRole('link', { name: 'Home', exact: true }).click();
    await expect(page).toHaveURL(/\/school\/school-home$/);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(`Manage the multiplication tables check for ${schoolName}`);

    await page.getByRole('button', { name: 'Remove impersonation', exact: true }).click();
    await expect(page).toHaveURL(/\/helpdesk\/school-impersonation$/);
    await expect(page.getByText('School impersonation has been removed', { exact: true })).toBeVisible();
    await page.locator('.govuk-breadcrumbs').getByRole('link', { name: 'Home', exact: true }).click();
    await expect(page).toHaveURL(/\/superuser$/);
    await expect(page.getByRole('heading', { name: 'MTC Superuser', exact: true })).toBeVisible();
    await expect(page.locator('.signed-in-as')).not.toContainText('DfE#');
    await expect(page.getByRole('button', { name: 'Remove impersonation', exact: true })).toHaveCount(0);
    await expect(page.getByRole('link', { name: 'Sign out', exact: true })).toBeVisible();
  });
});
