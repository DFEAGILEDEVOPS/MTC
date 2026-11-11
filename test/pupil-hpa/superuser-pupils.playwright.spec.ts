import { randomUUID } from 'node:crypto';
import { test, expect, type Page } from '@playwright/test';
import { loginAsSuperuser, requiredEnvironmentVariable } from './superuser-test.helpers';

function pupilUpn(): string {
  return requiredEnvironmentVariable('SUPERUSER_PUPIL_UPN');
}

function summaryValue(page: Page, label: string) {
  return page.locator('.govuk-summary-list__row')
    .filter({ has: page.locator('dt').filter({ hasText: new RegExp(`^\\s*${label}\\s*$`) }) })
    .locator('dd');
}

async function openSearch(page: Page): Promise<void> {
  await page.getByRole('link', { name: 'Pupil search', exact: true }).click();
  await expect(page).toHaveURL(/\/service-manager\/pupil-search$/);
  await expect(page.getByRole('heading', { name: 'Pupil Search', exact: true })).toBeVisible();
}

async function search(page: Page, upn: string): Promise<void> {
  await page.getByRole('textbox', { name: 'Search by UPN', exact: true }).fill(upn);
  await page.getByRole('button', { name: 'Search', exact: true }).click();
}

async function openPupil(page: Page): Promise<void> {
  await openSearch(page);
  await search(page, pupilUpn());
  await expect(page, 'The dedicated UPN must resolve to one pupil').toHaveURL(/\/service-manager\/pupil-summary\/[^/?]+$/);
  await expect(summaryValue(page, 'UPN')).toHaveText(pupilUpn());
}

async function openEdit(page: Page): Promise<void> {
  await page.getByRole('link', { name: 'Edit this pupil', exact: true }).click();
  await expect(page).toHaveURL(/\/service-manager\/pupil\/edit\/[^/]+$/);
  await expect(page.getByRole('heading', { name: 'Edit pupil details', exact: true })).toBeVisible();
  await expect(page.locator('#upn')).toHaveValue(pupilUpn());
}

async function expectSummary(page: Page, summaryUrl: string): Promise<void> {
  await expect(page).toHaveURL(url => url.origin + url.pathname.toLowerCase() === summaryUrl.toLowerCase());
  await expect(summaryValue(page, 'UPN')).toHaveText(pupilUpn());
}

test.describe('Superuser pupil search, summary and editing', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test.beforeEach(async ({ page }) => {
    await loginAsSuperuser(page);
  });

  test('finds the dedicated pupil and navigates summary/edit breadcrumbs back home', async ({ page }) => {
    await openPupil(page);
    const summaryUrl = page.url();
    const pupilName = (await page.getByRole('heading', { level: 1 }).innerText()).trim();
    expect(pupilName).not.toBe('');
    await expect(summaryValue(page, 'School')).not.toBeEmpty();
    await expect(summaryValue(page, 'DFE Number')).toHaveText(/^\s*\d{7}\s*$/);
    await openEdit(page);
    const firstName = await page.locator('#foreName').inputValue();
    const lastName = await page.locator('#lastName').inputValue();
    expect(pupilName).toBe(`${lastName}, ${firstName}`);
    const breadcrumbs = page.locator('.govuk-breadcrumbs');
    await breadcrumbs.getByRole('link', { name: 'Pupil Summary', exact: true }).click();
    await expectSummary(page, summaryUrl);
    await breadcrumbs.getByRole('link', { name: 'Pupil Search', exact: true }).click();
    await expect(page).toHaveURL(/\/service-manager\/pupil-search$/);
    await breadcrumbs.getByRole('link', { name: 'Home', exact: true }).click();
    await expect(page).toHaveURL(/\/superuser$/);
    await expect(page.getByRole('heading', { name: 'MTC Superuser', exact: true })).toBeVisible();
  });

  for (const { query, error } of [
    { query: '', error: 'No query provided' },
    { query: 'invalid', error: 'upn should be 13 characters and numbers' },
    { query: '!!!!!!!!!!!!!', error: 'upn should only contain alphanumeric characters' },
    { query: '0000000000000', error: 'No pupil found' },
  ]) {
    test(`rejects search input "${query}" with "${error}"`, async ({ page }) => {
      await openSearch(page);
      await search(page, query);
      await expect(page).toHaveURL(/\/service-manager\/pupil-search$/);
      await expect(page.locator('[data-module="govuk-error-summary"]')).toContainText(error);
      await expect(page.getByRole('textbox', { name: 'Search by UPN', exact: true })).toHaveValue(query);
    });
  }

  test('cancels pupil search back to the superuser homepage', async ({ page }) => {
    await openSearch(page);
    await page.getByRole('link', { name: 'Cancel', exact: true }).click();
    await expect(page).toHaveURL(/\/superuser$/);
    await expect(page.getByRole('heading', { name: 'MTC Superuser', exact: true })).toBeVisible();
  });

  test('saves a first-name edit, verifies persistence and restores the original name', async ({ page, browser, baseURL }) => {
    await openPupil(page);
    const summaryUrl = page.url();
    await openEdit(page);
    const editUrl = page.url();
    const originalName = await page.locator('#foreName').inputValue();
    const lastName = await page.locator('#lastName').inputValue();
    const editedName = `Playwright${randomUUID().replace(/[^a-z]/g, '')}`;
    try {
      await page.locator('#foreName').fill(editedName);
      await page.getByRole('button', { name: 'Save', exact: true }).click();
      await expectSummary(page, summaryUrl);
      await expect(page.getByText('Changes to pupil details have been saved', { exact: true })).toBeVisible();
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(`${lastName}, ${editedName}`);
      await page.reload();
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(`${lastName}, ${editedName}`);
      await openEdit(page);
      await expect(page.locator('#foreName')).toHaveValue(editedName);
    } finally {
      const context = await browser.newContext({ baseURL, storageState: { cookies: [], origins: [] } });
      try {
        const cleanupPage = await context.newPage();
        await loginAsSuperuser(cleanupPage);
        await cleanupPage.goto(editUrl);
        await expect(cleanupPage.locator('#upn')).toHaveValue(pupilUpn());
        const currentName = await cleanupPage.locator('#foreName').inputValue();
        if (currentName !== originalName) {
          expect(currentName, 'Refusing to overwrite an unexpected concurrent pupil-name change').toBe(editedName);
          await cleanupPage.locator('#foreName').fill(originalName);
          await cleanupPage.getByRole('button', { name: 'Save', exact: true }).click();
          await expectSummary(cleanupPage, summaryUrl);
        }
        await cleanupPage.goto(editUrl);
        await expect(cleanupPage.locator('#foreName')).toHaveValue(originalName);
        await expect(cleanupPage.locator('#upn')).toHaveValue(pupilUpn());
      } finally {
        await context.close();
      }
    }
  });

  test('cancels an edit without saving pupil details', async ({ page }) => {
    await openPupil(page);
    const summaryUrl = page.url();
    await openEdit(page);
    const originalName = await page.locator('#foreName').inputValue();
    await page.locator('#foreName').fill('Unsavedname');
    await page.getByRole('button', { name: 'Cancel', exact: true }).click();
    await expect(page).toHaveURL(/\/service-manager\/pupil-search$/);
    await search(page, pupilUpn());
    await expectSummary(page, summaryUrl);
    await page.reload();
    await openEdit(page);
    await expect(page.locator('#foreName')).toHaveValue(originalName);
  });

  test('rejects an empty first name, preserves form values and does not save', async ({ page }) => {
    await openPupil(page);
    const summaryUrl = page.url();
    await openEdit(page);
    const originalName = await page.locator('#foreName').inputValue();
    const lastName = await page.locator('#lastName').inputValue();
    await page.locator('#foreName').fill('');
    await page.getByRole('button', { name: 'Save', exact: true }).click();
    await expect(page).toHaveURL(/\/service-manager\/pupil\/edit$/);
    await expect(page.locator('[data-module="govuk-error-summary"]')).toContainText('Enter a first name in no more than 128 characters');
    await expect(page.locator('#foreName')).toHaveValue('');
    await expect(page.locator('#lastName')).toHaveValue(lastName);
    await expect(page.locator('#upn')).toHaveValue(pupilUpn());
    await page.getByRole('button', { name: 'Cancel', exact: true }).click();
    await expect(page).toHaveURL(/\/service-manager\/pupil-search$/);
    await search(page, pupilUpn());
    await expectSummary(page, summaryUrl);
    await page.reload();
    await openEdit(page);
    await expect(page.locator('#foreName')).toHaveValue(originalName);
  });
});
