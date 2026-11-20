import { test as base, expect, type Page } from '@playwright/test';
import { loginAsSuperuser, requiredEnvironmentVariable } from './superuser-test.helpers';

type AnnulmentReason = 'Maladministration' | 'Pupil Cheating';

function summaryValue(page: Page, label: string) {
  return page.locator('.govuk-summary-list__row')
    .filter({ has: page.locator('dt').filter({ hasText: new RegExp(`^\\s*${label}\\s*$`) }) }).locator('dd');
}

async function expectState(page: Page, annulled: boolean): Promise<void> {
  await expect(summaryValue(page, 'UPN')).toHaveText(requiredEnvironmentVariable('SUPERUSER_PUPIL_UPN'));
  await expect(summaryValue(page, 'Frozen')).toHaveText(annulled ? 'Frozen' : 'No');
  await expect(page.getByRole('link', { name: annulled ? 'Undo Annulment' : 'Annul this pupils results', exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: annulled ? 'Annul this pupils results' : 'Undo Annulment', exact: true })).toHaveCount(0);
  await expect(page.getByRole('link', { name: 'Freeze this pupil', exact: true })).toHaveCount(annulled ? 0 : 1);
  await expect(page.getByRole('link', { name: 'Thaw this pupil', exact: true })).toHaveCount(0);
}

async function openConfirmation(page: Page, undo: boolean): Promise<void> {
  await page.getByRole('link', { name: undo ? 'Undo Annulment' : 'Annul this pupils results', exact: true }).click();
  await expect(page.getByRole('heading', { name: undo ? 'Undo Pupil Annulment' : 'Confirm Pupil Annulment', exact: true })).toBeVisible();
  await expect(page.locator('#upn')).toHaveValue('');
}

async function submitConfirmation(page: Page, undo: boolean, summaryUrl: string): Promise<void> {
  await page.locator('#upn').fill(requiredEnvironmentVariable('SUPERUSER_PUPIL_UPN'));
  await page.getByRole('button', { name: undo ? 'Undo Annulment' : 'Confirm Annulment', exact: true }).click();
  await expect(page).toHaveURL(summaryUrl, { ignoreCase: true });
  await expectState(page, !undo);
  await page.reload();
  await expectState(page, !undo);
}

async function annul(page: Page, reason: AnnulmentReason, summaryUrl: string): Promise<void> {
  await openConfirmation(page, false);
  await page.getByRole('radio', { name: reason, exact: true }).check();
  await submitConfirmation(page, false, summaryUrl);
}

const test = base.extend<{ pupil: { summaryUrl: string; name: string; status: string } }>({
  pupil: [async ({ page, browser, baseURL }, use) => {
    await loginAsSuperuser(page);
    await page.getByRole('link', { name: 'Pupil search', exact: true }).click();
    await page.getByRole('textbox', { name: 'Search by UPN', exact: true })
      .fill(requiredEnvironmentVariable('SUPERUSER_PUPIL_UPN'));
    await page.getByRole('button', { name: 'Search', exact: true }).click();
    await expect(page, 'The dedicated UPN must resolve to one pupil').toHaveURL(/\/service-manager\/pupil-summary\/[^/]+$/);
    // Undo always unfreezes, so never overwrite an existing frozen/annulled fixture.
    await expectState(page, false);
    const summaryUrl = page.url();
    const name = (await page.getByRole('heading', { level: 1 }).innerText()).trim();
    const status = (await summaryValue(page, 'Status').innerText()).trim();
    expect(status, 'The test pupil must have a known original status').not.toBe('');
    try {
      await use({ summaryUrl, name, status });
    } finally {
      const context = await browser.newContext({ baseURL, storageState: { cookies: [], origins: [] } });
      try {
        const cleanupPage = await context.newPage();
        await loginAsSuperuser(cleanupPage);
        await cleanupPage.goto(summaryUrl);
        await expect(summaryValue(cleanupPage, 'UPN')).toHaveText(requiredEnvironmentVariable('SUPERUSER_PUPIL_UPN'));
        const undoLink = cleanupPage.getByRole('link', { name: 'Undo Annulment', exact: true });
        if (await undoLink.count() > 0) {
          await openConfirmation(cleanupPage, true);
          await submitConfirmation(cleanupPage, true, summaryUrl);
        }
        await cleanupPage.reload();
        await expectState(cleanupPage, false);
        await expect(summaryValue(cleanupPage, 'Status')).toHaveText(status);
        await expect(cleanupPage.getByRole('heading', { level: 1 })).toHaveText(name);
      } finally {
        await context.close();
      }
    }
  }, { timeout: 60_000 }],
});

test.describe('Superuser pupil annulment and undo', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  for (const reason of ['Maladministration', 'Pupil Cheating'] satisfies AnnulmentReason[]) {
    test(`annuls for ${reason}, persists after reload and restores status with undo`, async ({ page, pupil }) => {
      await annul(page, reason, pupil.summaryUrl);
      await expect(summaryValue(page, 'Status')).not.toHaveText(pupil.status);
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(pupil.name);
      await openConfirmation(page, true);
      await submitConfirmation(page, true, pupil.summaryUrl);
      await expect(summaryValue(page, 'Status')).toHaveText(pupil.status);
    });
  }

  for (const undo of [false, true]) {
    const action = undo ? 'Undo' : 'Annulment';
    test(`${action} identifies the pupil and Cancel preserves state`, async ({ page, pupil }) => {
      if (undo) await annul(page, 'Maladministration', pupil.summaryUrl);
      const status = (await summaryValue(page, 'Status').innerText()).trim();
      await openConfirmation(page, undo);
      await expect(page.getByLabel(`Confirm UPN for ${pupil.name}`, { exact: true })).toBeVisible();
      if (!undo) {
        await expect(page.getByRole('radio', { name: 'Maladministration', exact: true })).toBeChecked();
        await expect(page.getByRole('radio', { name: 'Pupil Cheating', exact: true })).not.toBeChecked();
      }
      await expect(page.getByRole('link', { name: 'Cancel', exact: true })).toHaveAttribute('href', new URL(pupil.summaryUrl).pathname);
      await page.getByRole('link', { name: 'Cancel', exact: true }).click();
      await expect(page).toHaveURL(pupil.summaryUrl, { ignoreCase: true });
      await page.reload();
      await expectState(page, undo);
      await expect(summaryValue(page, 'Status')).toHaveText(status);
    });

    for (const { upn, error } of [
      { upn: '', error: 'No upn provided' },
      { upn: '0000000000000', error: 'UPN does not match pupil' },
    ]) {
      test(`${action} rejects "${upn}" without changing state`, async ({ page, pupil }) => {
        if (undo) await annul(page, 'Maladministration', pupil.summaryUrl);
        const status = (await summaryValue(page, 'Status').innerText()).trim();
        await openConfirmation(page, undo);
        await page.locator('#upn').fill(upn);
        await page.getByRole('button', { name: undo ? 'Undo Annulment' : 'Confirm Annulment', exact: true }).click();
        await expect(page.locator('[data-module="govuk-error-summary"]')).toContainText(error);
        await expect(page.getByRole('heading', { name: undo ? 'Undo Pupil Annulment' : 'Confirm Pupil Annulment', exact: true })).toBeVisible();
        await page.getByRole('link', { name: 'Cancel', exact: true }).click();
        await expect(page).toHaveURL(pupil.summaryUrl, { ignoreCase: true });
        await page.reload();
        await expectState(page, undo);
        await expect(summaryValue(page, 'Status')).toHaveText(status);
      });
    }
  }

  test('uses annulment and undo breadcrumbs without reaching restricted pages', async ({ page, pupil }) => {
    await openConfirmation(page, false);
    const breadcrumbs = page.locator('.govuk-breadcrumbs');
    await breadcrumbs.getByRole('link', { name: 'Pupil Summary', exact: true }).click();
    await expect(page).toHaveURL(pupil.summaryUrl, { ignoreCase: true });
    await expectState(page, false);
    await annul(page, 'Pupil Cheating', pupil.summaryUrl);
    await openConfirmation(page, true);
    await breadcrumbs.getByRole('link', { name: 'Pupil Summary', exact: true }).click();
    await expect(page).toHaveURL(pupil.summaryUrl, { ignoreCase: true });
    await expectState(page, true);
    await openConfirmation(page, true);
    await breadcrumbs.getByRole('link', { name: 'Home', exact: true }).click();
    await expect(page).toHaveURL(/\/superuser$/);
    await expect(page.getByRole('heading', { name: 'MTC Superuser', exact: true })).toBeVisible();
  });
});
