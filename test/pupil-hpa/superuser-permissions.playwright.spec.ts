import { test, expect, type Page } from '@playwright/test';
import { loginAsSuperuser, loginAsTeacher, requiredEnvironmentVariable } from './superuser-test.helpers';

async function expectDenied(page: Page, path: string): Promise<void> {
  await page.goto(path);
  await expect(page).toHaveURL(/\/unauthorised$/);
  await expect(page.getByRole('heading', { name: 'Access unauthorised', exact: true })).toBeVisible();
  await expect(page.getByText("You're not authorised to access this page.", { exact: true })).toBeVisible();
  await expect(page.locator('main form')).toHaveCount(0);
}

test.describe('Superuser service-manager permission boundaries', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test.beforeEach(async ({ page }) => {
    await loginAsSuperuser(page);
  });

  for (const path of [
    '/service-manager/home',
    '/service-manager/organisations',
    '/service-manager/organisations/add',
    '/service-manager/organisations/upload',
    '/service-manager/check-settings',
    '/service-manager/mod-settings',
    '/service-manager/upload-pupil-census',
    '/service-manager/jobs',
    '/service-manager/job-outputs',
    '/service-manager/attendance-codes',
    '/service-manager/audit-payload?auditEntryId=1',
  ]) {
    test(`denies direct navigation to ${path}`, async ({ page }) => {
      await expectDenied(page, path);
      await page.getByRole('link', { name: 'Back to home', exact: true }).click();
      await expect(page).toHaveURL(/\/superuser$/);
      await expect(page.getByRole('heading', { name: 'MTC Superuser', exact: true })).toBeVisible();
    });
  }
});

test.describe('Teacher cannot access superuser/internal administration', () => {
  test.use({ storageState: { cookies: [], origins: [] } });
  let organisationPath: string;
  let pupilSummaryPath: string;
  let pupilSlug: string;

  test.beforeAll(async ({ browser, baseURL }) => {
    // Resolve real records so parameterised routes cannot pass merely because a record is missing.
    const context = await browser.newContext({ baseURL, storageState: { cookies: [], origins: [] } });
    try {
      const page = await context.newPage();
      await loginAsSuperuser(page);
      await page.getByRole('link', { name: 'Search organisations', exact: true }).click();
      await page.getByRole('textbox', { name: 'Search', exact: true })
        .fill(requiredEnvironmentVariable('SUPERUSER_SCHOOL_DFE_NUMBER'));
      await page.getByRole('button', { name: 'Search', exact: true }).click();
      await expect(page).toHaveURL(/\/service-manager\/organisations\/[^/]+$/);
      await expect(page.getByRole('link', { name: 'Edit organisation', exact: true })).toBeVisible();
      organisationPath = new URL(page.url()).pathname;
      await page.goto('/superuser');
      await page.getByRole('link', { name: 'Pupil search', exact: true }).click();
      await page.getByRole('textbox', { name: 'Search by UPN', exact: true })
        .fill(requiredEnvironmentVariable('SUPERUSER_PUPIL_UPN'));
      await page.getByRole('button', { name: 'Search', exact: true }).click();
      await expect(page).toHaveURL(/\/service-manager\/pupil-summary\/[^/]+$/);
      await expect(page.getByRole('link', { name: 'Edit this pupil', exact: true })).toBeVisible();
      pupilSummaryPath = new URL(page.url()).pathname;
      pupilSlug = pupilSummaryPath.substring(pupilSummaryPath.lastIndexOf('/') + 1);
    } finally {
      await context.close();
    }
  });

  test.beforeEach(async ({ page }) => {
    await loginAsTeacher(page);
  });

  for (const path of [
    '/superuser',
    '/helpdesk/school-impersonation',
    '/service-manager/organisations/search',
    '/service-manager/pupil-search',
    '/service-message',
    '/service-message/service-message-form',
  ]) {
    test(`denies teacher direct navigation to ${path}`, async ({ page }) => {
      await expectDenied(page, path);
      await page.getByRole('link', { name: 'Back to home', exact: true }).click();
      await expect(page).toHaveURL(/\/school\/school-home$/);
      await expect(page.getByRole('heading', { level: 1 })).toContainText('Manage the multiplication tables check for');
    });
  }

  for (const target of ['organisation', 'organisation-edit', 'hdf', 'pupil', 'pupil-edit', 'move', 'freeze', 'thaw', 'annul', 'undo']) {
    test(`denies teacher access to an existing ${target} record/action`, async ({ page }) => {
      const paths: Record<string, string> = {
        organisation: organisationPath,
        'organisation-edit': `${organisationPath}/edit`,
        hdf: `${organisationPath}/hdfstatus`,
        pupil: pupilSummaryPath,
        'pupil-edit': `/service-manager/pupil/edit/${pupilSlug}`,
        move: `/service-manager/pupil/move/${pupilSlug}`,
        freeze: `/service-manager/pupil/freeze/${pupilSlug}`,
        thaw: `/service-manager/pupil/thaw/${pupilSlug}`,
        annul: `/service-manager/annul-pupil/${pupilSlug}`,
        undo: `/service-manager/annul-pupil-undo/${pupilSlug}`,
      };
      await expectDenied(page, paths[target]);
    });
  }
});

test.describe('Signed-out internal administration access', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  for (const path of [
    '/superuser',
    '/helpdesk/school-impersonation',
    '/service-manager/organisations/search',
    '/service-manager/pupil-search',
    '/service-message',
    '/service-message/service-message-form',
  ]) {
    test(`requires sign-in for ${path}`, async ({ page }) => {
      await page.goto(path);
      await expect(page).toHaveURL(/\/sign-in$/);
      await expect(page.getByRole('textbox', { name: 'Enter your user name.', exact: true })).toBeVisible();
      await expect(page.getByRole('button', { name: 'Sign in', exact: true })).toBeVisible();
      await expect(page.getByRole('heading', { name: 'MTC Superuser', exact: true })).toHaveCount(0);
    });
  }
});
