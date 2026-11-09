import { test as base, expect, type Page } from '@playwright/test';
import { loginAsServiceManager, requiredEnvironmentVariable } from './superuser-test.helpers';

const actions = {
  freeze: { link: 'Freeze this pupil', heading: 'Confirm Pupil Freeze', button: 'Confirm Freeze' },
  thaw: { link: 'Thaw this pupil', heading: 'Confirm Pupil Thaw', button: 'Confirm Thaw' },
  annul: { link: 'Annul this pupils results', heading: 'Confirm Pupil Annulment', button: 'Confirm Annulment' },
  undo: { link: 'Undo Annulment', heading: 'Undo Pupil Annulment', button: 'Undo Annulment' },
};
type Action = keyof typeof actions;

function summaryValue(page: Page, label: string) {
  return page.locator('.govuk-summary-list__row')
    .filter({ has: page.locator('dt').filter({ hasText: new RegExp(`^\\s*${label}\\s*$`) }) }).locator('dd');
}

async function openAction(page: Page, action: Action): Promise<void> {
  await page.getByRole('link', { name: actions[action].link, exact: true }).click();
  await expect(page.getByRole('heading', { name: actions[action].heading, exact: true })).toBeVisible();
}

async function submitAction(page: Page, action: Action, summaryUrl: string): Promise<void> {
  await openAction(page, action);
  await page.locator('#upn').fill(requiredEnvironmentVariable('SUPERUSER_PUPIL_UPN'));
  await page.getByRole('button', { name: actions[action].button, exact: true }).click();
  await expect(page).toHaveURL(summaryUrl, { ignoreCase: true });
  await page.reload();
  await expect(summaryValue(page, 'UPN')).toHaveText(requiredEnvironmentVariable('SUPERUSER_PUPIL_UPN'));
  await expect(summaryValue(page, 'Frozen')).toHaveText(action === 'freeze' || action === 'annul' ? 'Frozen' : 'No');
  await expect(page.getByRole('link', { name: action === 'annul' ? actions.undo.link : actions.annul.link, exact: true })).toBeVisible();
  if (action !== 'annul') {
    await expect(page.getByRole('link', { name: action === 'freeze' ? actions.thaw.link : actions.freeze.link, exact: true })).toBeVisible();
  }
}

const test = base.extend<{ pupil: { summaryUrl: string; status: string; name: string } }>({
  pupil: [async ({ page, browser, baseURL }, use) => {
    await loginAsServiceManager(page);
    await page.getByRole('link', { name: 'Pupil Search', exact: true }).click();
    await page.getByRole('textbox', { name: 'Search by UPN', exact: true })
      .fill(requiredEnvironmentVariable('SUPERUSER_PUPIL_UPN'));
    await page.getByRole('button', { name: 'Search', exact: true }).click();
    await expect(page).toHaveURL(/\/service-manager\/pupil-summary\/[^/]+$/);
    await expect(summaryValue(page, 'UPN')).toHaveText(requiredEnvironmentVariable('SUPERUSER_PUPIL_UPN'));
    await expect(summaryValue(page, 'Frozen'), 'Prepare an unfrozen dedicated pupil').toHaveText('No');
    await expect(page.getByRole('link', { name: actions.annul.link, exact: true }), 'Prepare an unannulled dedicated pupil').toBeVisible();
    const summaryUrl = page.url();
    const status = (await summaryValue(page, 'Status').innerText()).trim();
    const name = (await page.getByRole('heading', { level: 1 }).innerText()).trim();
    expect(status).not.toBe('');
    try {
      await use({ summaryUrl, status, name });
    } finally {
      const context = await browser.newContext({ baseURL, storageState: { cookies: [], origins: [] } });
      try {
        const cleanupPage = await context.newPage();
        await loginAsServiceManager(cleanupPage);
        await cleanupPage.goto(summaryUrl);
        await expect(summaryValue(cleanupPage, 'UPN')).toHaveText(requiredEnvironmentVariable('SUPERUSER_PUPIL_UPN'));
        if (await cleanupPage.getByRole('link', { name: actions.undo.link, exact: true }).count() > 0) {
          await submitAction(cleanupPage, 'undo', summaryUrl);
        }
        await expect(summaryValue(cleanupPage, 'Frozen')).toHaveText(/^\s*(Frozen|No)\s*$/);
        if ((await summaryValue(cleanupPage, 'Frozen').innerText()).trim() === 'Frozen') {
          await submitAction(cleanupPage, 'thaw', summaryUrl);
        }
        await cleanupPage.reload();
        await expect(summaryValue(cleanupPage, 'Frozen')).toHaveText('No');
        await expect(summaryValue(cleanupPage, 'Status')).toHaveText(status);
        await expect(cleanupPage.getByRole('heading', { level: 1 })).toHaveText(name);
        await expect(cleanupPage.getByRole('link', { name: actions.annul.link, exact: true })).toBeVisible();
        await expect(cleanupPage.getByRole('link', { name: actions.freeze.link, exact: true })).toBeVisible();
      } finally {
        await context.close();
      }
    }
  }, { timeout: 60_000 }],
});

test.describe('Service-manager shared pupil administration regression', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test('logs in to the service-manager homepage with existing administration links', async ({ page }) => {
    await loginAsServiceManager(page);
    for (const [name, href] of [
      ['Manage check windows', /\/(?:check-window\/manage-check-windows|service-manager\/check-windows)$/],
      ['Service message', '/service-message'],
      ['Manage organisations', '/service-manager/organisations'],
      ['Pupil Search', '/service-manager/pupil-search'],
      ['View Jobs', '/service-manager/jobs'],
    ] as const) {
      const link = page.getByRole('link', { name, exact: true });
      await expect(link).toBeVisible();
      await expect(link).toHaveAttribute('href', href);
    }
  });

  for (const action of ['freeze', 'thaw', 'annul', 'undo'] as const) {
    for (const validation of [false, true]) {
      test(`${action} Cancel returns to service-manager home${validation ? ' after UPN validation errors' : ''}`, async ({ page, pupil }) => {
        if (action === 'thaw') await submitAction(page, 'freeze', pupil.summaryUrl);
        if (action === 'undo') await submitAction(page, 'annul', pupil.summaryUrl);
        const beforeFrozen = (await summaryValue(page, 'Frozen').innerText()).trim();
        const beforeStatus = (await summaryValue(page, 'Status').innerText()).trim();
        await openAction(page, action);
        await expect(page.getByLabel(`Confirm UPN for ${pupil.name}`, { exact: true })).toBeVisible();
        if (validation) {
          for (const [upn, error] of [['', 'No upn provided'], ['0000000000000', 'UPN does not match pupil']]) {
            await page.locator('#upn').fill(upn);
            await page.getByRole('button', { name: actions[action].button, exact: true }).click();
            await expect(page.locator('[data-module="govuk-error-summary"]')).toContainText(error);
            await expect(page.getByRole('heading', { name: actions[action].heading, exact: true })).toBeVisible();
          }
        }
        await expect(page.getByRole('link', { name: 'Cancel', exact: true })).toHaveAttribute('href', '/service-manager/home');
        await page.getByRole('link', { name: 'Cancel', exact: true }).click();
        await expect(page).toHaveURL(/\/service-manager\/home$/);
        await expect(page.getByRole('heading', { name: 'Multiplication tables check for service managers', exact: true })).toBeVisible();
        await page.goto(pupil.summaryUrl);
        await expect(summaryValue(page, 'Frozen')).toHaveText(beforeFrozen);
        await expect(summaryValue(page, 'Status')).toHaveText(beforeStatus);
      });
    }
  }

  test('freezes and thaws successfully with the original status restored', async ({ page, pupil }) => {
    await submitAction(page, 'freeze', pupil.summaryUrl);
    await submitAction(page, 'thaw', pupil.summaryUrl);
    await expect(summaryValue(page, 'Status')).toHaveText(pupil.status);
  });

  test('annuls and undoes successfully with the original status restored', async ({ page, pupil }) => {
    await submitAction(page, 'annul', pupil.summaryUrl);
    await expect(summaryValue(page, 'Status')).not.toHaveText(pupil.status);
    await submitAction(page, 'undo', pupil.summaryUrl);
    await expect(summaryValue(page, 'Status')).toHaveText(pupil.status);
  });
});
