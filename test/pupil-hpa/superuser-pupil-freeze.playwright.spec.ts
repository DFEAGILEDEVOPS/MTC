import { test as base, expect, type Page } from '@playwright/test';
import { loginAsSuperuser, requiredEnvironmentVariable } from './superuser-test.helpers';

function frozenValue(page: Page) {
  return page.locator('.govuk-summary-list__row')
    .filter({ has: page.locator('dt').filter({ hasText: /^\s*Frozen\s*$/ }) }).locator('dd');
}

async function expectState(page: Page, frozen: boolean): Promise<void> {
  await expect(frozenValue(page)).toHaveText(frozen ? 'Frozen' : 'No');
  await expect(page.getByRole('link', { name: frozen ? 'Thaw this pupil' : 'Freeze this pupil', exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: frozen ? 'Freeze this pupil' : 'Thaw this pupil', exact: true })).toHaveCount(0);
}

async function openConfirmation(page: Page, freeze: boolean): Promise<void> {
  await page.getByRole('link', { name: freeze ? 'Freeze this pupil' : 'Thaw this pupil', exact: true }).click();
  await expect(page.getByRole('heading', { name: freeze ? 'Confirm Pupil Freeze' : 'Confirm Pupil Thaw', exact: true })).toBeVisible();
  await expect(page.getByRole('textbox')).toHaveValue('');
}

async function changeState(page: Page, frozen: boolean, summaryUrl: string): Promise<void> {
  await openConfirmation(page, frozen);
  await page.locator('#upn').fill(requiredEnvironmentVariable('SUPERUSER_PUPIL_UPN'));
  await page.getByRole('button', { name: frozen ? 'Confirm Freeze' : 'Confirm Thaw', exact: true }).click();
  await expect(page).toHaveURL(summaryUrl, { ignoreCase: true });
  await expectState(page, frozen);
  await page.reload();
  await expectState(page, frozen);
}

const test = base.extend<{ pupil: { summaryUrl: string; name: string; originalFrozen: boolean } }>({
  pupil: [async ({ page, browser, baseURL }, use) => {
    await loginAsSuperuser(page);
    await page.getByRole('link', { name: 'Pupil search', exact: true }).click();
    await page.getByRole('textbox', { name: 'Search by UPN', exact: true })
      .fill(requiredEnvironmentVariable('SUPERUSER_PUPIL_UPN'));
    await page.getByRole('button', { name: 'Search', exact: true }).click();
    await expect(page).toHaveURL(/\/service-manager\/pupil-summary\/[^/]+$/);
    const upnRow = page.locator('.govuk-summary-list__row')
      .filter({ has: page.locator('dt').filter({ hasText: /^\s*UPN\s*$/ }) }).locator('dd');
    await expect(upnRow).toHaveText(requiredEnvironmentVariable('SUPERUSER_PUPIL_UPN'));
    const summaryUrl = page.url();
    const name = (await page.getByRole('heading', { level: 1 }).innerText()).trim();
    await expect(frozenValue(page)).toHaveText(/^\s*(Frozen|No)\s*$/);
    const originalFrozen = (await frozenValue(page).innerText()).trim() === 'Frozen';
    await expectState(page, originalFrozen);
    try {
      if (originalFrozen) await changeState(page, false, summaryUrl);
      await use({ summaryUrl, name, originalFrozen });
    } finally {
      const context = await browser.newContext({ baseURL, storageState: { cookies: [], origins: [] } });
      try {
        const cleanupPage = await context.newPage();
        await loginAsSuperuser(cleanupPage);
        await cleanupPage.goto(summaryUrl);
        await expect(frozenValue(cleanupPage)).toHaveText(/^\s*(Frozen|No)\s*$/);
        const currentFrozen = (await frozenValue(cleanupPage).innerText()).trim() === 'Frozen';
        if (currentFrozen !== originalFrozen) await changeState(cleanupPage, originalFrozen, summaryUrl);
        await cleanupPage.reload();
        await expectState(cleanupPage, originalFrozen);
      } finally {
        await context.close();
      }
    }
  }, { timeout: 60_000 }],
});

test.describe('Superuser freeze and thaw', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  for (const freeze of [true, false]) {
    const action = freeze ? 'Freeze' : 'Thaw';
    test(`${action} confirmation identifies the pupil and Cancel preserves state`, async ({ page, pupil }) => {
      if (!freeze) await changeState(page, true, pupil.summaryUrl);
      await openConfirmation(page, freeze);
      await expect(page.getByLabel(`Confirm UPN for ${pupil.name}`, { exact: true })).toBeVisible();
      await expect(page.getByRole('link', { name: 'Cancel', exact: true })).toHaveAttribute('href', new URL(pupil.summaryUrl).pathname);
      await page.getByRole('link', { name: 'Cancel', exact: true }).click();
      await expect(page).toHaveURL(pupil.summaryUrl, { ignoreCase: true });
      await page.reload();
      await expectState(page, !freeze);
    });

    for (const { upn, error } of [
      { upn: '', error: 'No upn provided' },
      { upn: '0000000000000', error: 'UPN does not match pupil' },
    ]) {
      test(`${action} rejects "${upn}" without changing state`, async ({ page, pupil }) => {
        if (!freeze) await changeState(page, true, pupil.summaryUrl);
        await openConfirmation(page, freeze);
        await page.locator('#upn').fill(upn);
        await page.getByRole('button', { name: `Confirm ${action}`, exact: true }).click();
        await expect(page.locator('[data-module="govuk-error-summary"]')).toContainText(error);
        await expect(page.getByRole('heading', { name: `Confirm Pupil ${action}`, exact: true })).toBeVisible();
        await page.getByRole('link', { name: 'Cancel', exact: true }).click();
        await page.reload();
        await expectState(page, !freeze);
      });
    }
  }

  test('freezes and thaws with status and actions persisting after reload', async ({ page, pupil }) => {
    await changeState(page, true, pupil.summaryUrl);
    await changeState(page, false, pupil.summaryUrl);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(pupil.name);
  });

  test('uses confirmation breadcrumbs to return to the summary and superuser home', async ({ page, pupil }) => {
    await openConfirmation(page, true);
    const breadcrumbs = page.locator('.govuk-breadcrumbs');
    await breadcrumbs.getByRole('link', { name: 'Pupil Summary', exact: true }).click();
    await expect(page).toHaveURL(pupil.summaryUrl, { ignoreCase: true });
    await expectState(page, false);
    await changeState(page, true, pupil.summaryUrl);
    await openConfirmation(page, false);
    await breadcrumbs.getByRole('link', { name: 'Pupil Summary', exact: true }).click();
    await expect(page).toHaveURL(pupil.summaryUrl, { ignoreCase: true });
    await expectState(page, true);
    await openConfirmation(page, false);
    await breadcrumbs.getByRole('link', { name: 'Home', exact: true }).click();
    await expect(page).toHaveURL(/\/superuser$/);
    await expect(page.getByRole('heading', { name: 'MTC Superuser', exact: true })).toBeVisible();
  });
});
