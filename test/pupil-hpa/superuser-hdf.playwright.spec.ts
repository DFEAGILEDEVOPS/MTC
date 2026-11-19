import { test, expect, type Page } from '@playwright/test';
import { loginAsSuperuser, requiredEnvironmentVariable } from './superuser-test.helpers';

function summaryValue(page: Page, label: string) {
  return page.locator('.govuk-summary-list__row')
    .filter({ has: page.locator('dt').filter({ hasText: new RegExp(`^\\s*${label}\\s*$`) }) })
    .locator('dd');
}

async function openHdfSummary(page: Page): Promise<{ detailUrl: string; schoolName: string; urn: string }> {
  const dfeNumber = requiredEnvironmentVariable('SUPERUSER_HDF_SCHOOL_DFE_NUMBER');
  await page.getByRole('link', { name: 'Search organisations', exact: true }).click();
  await page.getByRole('textbox', { name: 'Search', exact: true }).fill(dfeNumber);
  await page.getByRole('button', { name: 'Search', exact: true }).click();
  await expect(page).toHaveURL(/\/service-manager\/organisations\/[^/]+$/);
  await expect(summaryValue(page, 'DFE Number')).toHaveText(dfeNumber);
  const detailUrl = page.url();
  const schoolName = (await page.getByRole('heading', { level: 1 }).innerText()).trim();
  const urn = (await summaryValue(page, 'URN').innerText()).trim();
  await page.getByRole('link', { name: 'Manage HDF Submission', exact: true }).click();
  await expect(page).toHaveURL(`${detailUrl}/hdfstatus`, { ignoreCase: true });
  return { detailUrl, schoolName, urn };
}

test.describe('Superuser HDF summary (read-only)', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test.beforeEach(async ({ page }) => {
    await loginAsSuperuser(page);
  });

  test('views the prepared HDF submission and retains its details after reload', async ({ page }) => {
    const { schoolName, urn } = await openHdfSummary(page);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(schoolName);
    await expect(summaryValue(page, 'DFE Number')).toHaveText(requiredEnvironmentVariable('SUPERUSER_HDF_SCHOOL_DFE_NUMBER'));
    await expect(summaryValue(page, 'URN')).toHaveText(urn);
    const submission = summaryValue(page, 'Submission Date:');
    await expect(submission, 'Prepare a signed HDF for the dedicated school before running this test').toContainText('(UTC)');
    const submissionDate = (await submission.innerText()).trim();
    await expect(page.getByRole('button', { name: 'Delete Submission', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Undo Deletion', exact: true })).toHaveCount(0);
    await page.reload();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(schoolName);
    await expect(summaryValue(page, 'DFE Number')).toHaveText(requiredEnvironmentVariable('SUPERUSER_HDF_SCHOOL_DFE_NUMBER'));
    await expect(submission).toHaveText(submissionDate);
    await expect(page.getByRole('button', { name: 'Delete Submission', exact: true })).toBeVisible();
  });

  test('navigates through organisation and search breadcrumbs back to the superuser homepage', async ({ page }) => {
    const { detailUrl, schoolName } = await openHdfSummary(page);
    const breadcrumbs = page.locator('.govuk-breadcrumbs');
    await expect(breadcrumbs.locator('[aria-current="page"]')).toHaveText('HDF Submission Summary');
    await expect(breadcrumbs.getByRole('link', { name: 'Manage organisations', exact: true })).toHaveAttribute('href', '/superuser');
    await breadcrumbs.getByRole('link', { name: 'View organisation', exact: true }).click();
    await expect(page).toHaveURL(detailUrl, { ignoreCase: true });
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(schoolName);
    await page.getByRole('link', { name: 'Manage HDF Submission', exact: true }).click();
    await breadcrumbs.getByRole('link', { name: 'Search organisations', exact: true }).click();
    await expect(page).toHaveURL(/\/service-manager\/organisations\/search$/);
    await expect(page.getByRole('heading', { name: 'Search organisations', exact: true })).toBeVisible();
    await page.getByRole('textbox', { name: 'Search', exact: true }).fill(requiredEnvironmentVariable('SUPERUSER_HDF_SCHOOL_DFE_NUMBER'));
    await page.getByRole('button', { name: 'Search', exact: true }).click();
    await page.getByRole('link', { name: 'Manage HDF Submission', exact: true }).click();
    await breadcrumbs.getByRole('link', { name: 'Manage organisations', exact: true }).click();
    await expect(page).toHaveURL(/\/superuser$/);
    await expect(page.getByRole('heading', { name: 'MTC Superuser', exact: true })).toBeVisible();
    await openHdfSummary(page);
    await breadcrumbs.getByRole('link', { name: 'Home', exact: true }).click();
    await expect(page).toHaveURL(/\/superuser$/);
    await expect(page.getByRole('heading', { name: 'MTC Superuser', exact: true })).toBeVisible();
  });
});
