import { test, expect, type Page } from '@playwright/test';
import { loginAsSuperuser, requiredEnvironmentVariable } from './superuser-test.helpers';

async function openSearch(page: Page): Promise<void> {
  await page.getByRole('link', { name: 'Search organisations', exact: true }).click();
  await expect(page).toHaveURL(/\/service-manager\/organisations\/search$/);
  await expect(page.getByRole('heading', { name: 'Search organisations', exact: true })).toBeVisible();
}

async function search(page: Page, query: string): Promise<void> {
  await page.getByRole('textbox', { name: 'Search', exact: true }).fill(query);
  await page.getByRole('button', { name: 'Search', exact: true }).click();
}

function summaryValue(page: Page, label: string) {
  return page.locator('.govuk-summary-list__row')
    .filter({ has: page.locator('dt').filter({ hasText: new RegExp(`^\\s*${label}\\s*$`) }) })
    .locator('dd');
}

async function openOrganisation(page: Page): Promise<void> {
  await openSearch(page);
  await search(page, requiredEnvironmentVariable('SUPERUSER_SCHOOL_DFE_NUMBER'));
  await expect(page).toHaveURL(/\/service-manager\/organisations\/[^/]+$/);
  await expect(summaryValue(page, 'DFE Number')).toHaveText(requiredEnvironmentVariable('SUPERUSER_SCHOOL_DFE_NUMBER'));
}

test.describe('Superuser organisation search, view and edit', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test.beforeEach(async ({ page }) => {
    await loginAsSuperuser(page);
  });

  test('searches by DfE number and provides accessible view/edit navigation', async ({ page }) => {
    await openOrganisation(page);
    const originalName = await page.getByRole('heading', { level: 1 }).innerText();
    expect(originalName.trim()).not.toBe('');
    const detailUrl = page.url();
    await expect(page.locator('#school-audit')).toHaveCount(0);
    await page.getByRole('link', { name: 'Edit organisation', exact: true }).click();
    await expect(page).toHaveURL(`${detailUrl}/edit`, { ignoreCase: true });
    await expect(page.locator('#name')).toHaveValue(originalName.trim());
    await expect(page.locator('#dfeNumber')).toHaveValue(requiredEnvironmentVariable('SUPERUSER_SCHOOL_DFE_NUMBER'));
    const breadcrumbs = page.locator('.govuk-breadcrumbs');
    await expect(breadcrumbs.getByRole('link', { name: 'Manage organisations', exact: true })).toHaveAttribute('href', '/superuser');
    await breadcrumbs.getByRole('link', { name: 'Search organisations', exact: true }).click();
    await expect(page).toHaveURL(/\/service-manager\/organisations\/search$/);
    await search(page, requiredEnvironmentVariable('SUPERUSER_SCHOOL_DFE_NUMBER'));
    await page.getByRole('link', { name: 'Edit organisation', exact: true }).click();
    await breadcrumbs.getByRole('link', { name: 'Manage organisations', exact: true }).click();
    await expect(page).toHaveURL(/\/superuser$/);
  });

  test('searches by URN and opens the same organisation', async ({ page }) => {
    await openOrganisation(page);
    const detailUrl = page.url();
    const originalName = await page.getByRole('heading', { level: 1 }).innerText();
    const urn = (await summaryValue(page, 'URN').innerText()).trim();
    expect(urn).toMatch(/^\d+$/);
    await page.getByRole('link', { name: 'Back to search', exact: true }).click();
    await search(page, urn);
    await expect(page).toHaveURL(detailUrl);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(originalName);
    await expect(summaryValue(page, 'DFE Number')).toHaveText(requiredEnvironmentVariable('SUPERUSER_SCHOOL_DFE_NUMBER'));
  });

  for (const { query, error } of [
    { query: '', error: 'No query provided' },
    { query: '0000000', error: 'No school found' },
  ]) {
    test(`shows "${error}" for search input "${query}"`, async ({ page }) => {
      await openSearch(page);
      await search(page, query);
      await expect(page).toHaveURL(/\/service-manager\/organisations\/search$/);
      await expect(page.locator('[data-module="govuk-error-summary"]')).toContainText(error);
      await expect(page.getByRole('textbox', { name: 'Search', exact: true })).toHaveValue(query);
    });
  }

  test('cancels search back to the superuser homepage', async ({ page }) => {
    await openSearch(page);
    await page.getByRole('link', { name: 'Cancel', exact: true }).click();
    await expect(page).toHaveURL(/\/superuser$/);
    await expect(page.getByRole('heading', { name: 'MTC Superuser', exact: true })).toBeVisible();
  });

  test('saves an edited name, verifies persistence and restores the original name', async ({ page, browser, baseURL }) => {
    await openOrganisation(page);
    const detailUrl = page.url();
    const originalName = (await page.getByRole('heading', { level: 1 }).innerText()).trim();
    const editedName = `Playwright superuser ${Date.now()}`;
    await page.getByRole('link', { name: 'Edit organisation', exact: true }).click();
    await expect(page.locator('#typeOfEstablishmentCode'), 'Prepare the dedicated test school with a valid establishment type before running save coverage').not.toHaveValue('');
    await page.locator('#name').fill(editedName);
    try {
      await page.getByRole('button', { name: 'Update organisation', exact: true }).click();
      await expect(page).toHaveURL(detailUrl, { ignoreCase: true });
      await expect(page.getByText('School updated', { exact: true })).toBeVisible();
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(editedName);
      await page.reload();
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(editedName);
      await page.getByRole('link', { name: 'Edit organisation', exact: true }).click();
      await expect(page.locator('#name')).toHaveValue(editedName);
    } finally {
      // A separate session can restore data even if the test page was closed or timed out.
      const cleanupContext = await browser.newContext({ baseURL, storageState: { cookies: [], origins: [] } });
      try {
        const cleanupPage = await cleanupContext.newPage();
        await loginAsSuperuser(cleanupPage);
        await cleanupPage.goto(`${detailUrl}/edit`);
        const currentName = await cleanupPage.locator('#name').inputValue();
        if (currentName !== originalName) {
          expect(currentName, 'Refusing to overwrite an unexpected concurrent school-name change').toBe(editedName);
          await cleanupPage.locator('#name').fill(originalName);
          await cleanupPage.getByRole('button', { name: 'Update organisation', exact: true }).click();
          await expect(cleanupPage).toHaveURL(detailUrl);
        }
        await cleanupPage.goto(detailUrl);
        await expect(cleanupPage.getByRole('heading', { level: 1 })).toHaveText(originalName);
      } finally {
        await cleanupContext.close();
      }
    }
  });

  test('discards edits without changing the organisation', async ({ page }) => {
    await openOrganisation(page);
    const detailUrl = page.url();
    const originalName = (await page.getByRole('heading', { level: 1 }).innerText()).trim();
    await page.getByRole('link', { name: 'Edit organisation', exact: true }).click();
    await page.locator('#name').fill('Unsaved Playwright school name');
    await page.getByRole('link', { name: 'Discard edits and view organisation', exact: true }).click();
    await expect(page).toHaveURL(detailUrl, { ignoreCase: true });
    await page.reload();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(originalName);
    await page.getByRole('link', { name: 'Edit organisation', exact: true }).click();
    await expect(page.locator('#name')).toHaveValue(originalName);
  });

  test('rejects an empty name, preserves entered values and does not save', async ({ page }) => {
    await openOrganisation(page);
    const detailUrl = page.url();
    const originalName = (await page.getByRole('heading', { level: 1 }).innerText()).trim();
    await page.getByRole('link', { name: 'Edit organisation', exact: true }).click();
    await page.locator('#name').fill('');
    const urn = await page.locator('#urn').inputValue();
    const leaCode = await page.locator('#leaCode').inputValue();
    await page.getByRole('button', { name: 'Update organisation', exact: true }).click();
    await expect(page).toHaveURL(`${detailUrl}/edit`, { ignoreCase: true });
    await expect(page.locator('[data-module="govuk-error-summary"]')).toContainText('School name is too short');
    await expect(page.locator('#name')).toHaveValue('');
    await expect(page.locator('#urn')).toHaveValue(urn);
    await expect(page.locator('#leaCode')).toHaveValue(leaCode);
    await page.getByRole('link', { name: 'Discard edits and view organisation', exact: true }).click();
    await page.reload();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(originalName);
  });
});
