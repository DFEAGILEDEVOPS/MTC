import { test as base, expect, type Page } from '@playwright/test';
import { environmentUrls } from './playwright.config';
import { signIn } from './superuser-test.helpers';

const TEACHER_CREDENTIALS = {
  username: process.env.ADMIN_USERNAME ?? 'teacher2',
  password: process.env.ADMIN_PASSWORD ?? 'password',
};

const SERVICE_MANAGER_CREDENTIALS = {
  username: 'service-manager',
  password: 'password',
};

const holdingPageHeading = 'Multiplication tables check temporarily closed';

async function loginAsServiceManager(page: Page): Promise<void> {
  await signIn(page, SERVICE_MANAGER_CREDENTIALS.username, SERVICE_MANAGER_CREDENTIALS.password);
  await expect(page).toHaveURL(/\/service-manager\/home$/);
  await expect(page.getByRole('heading', { name: 'Multiplication tables check for service managers', exact: true })).toBeVisible();
}

async function openSwitch(page: Page): Promise<void> {
  await page.getByRole('link', { name: 'Emergency off switch', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Emergency off-switch', exact: true })).toBeVisible();
}

async function setSwitch(page: Page, enabled: boolean): Promise<void> {
  await page.locator(enabled ? '#switch-on' : '#switch-off').check();
  await page.getByRole('button', { name: 'Update emergency off-switch', exact: true }).click();
  await expect(page.getByText('Emergency off-switch status updated', { exact: true })).toBeVisible();
  await expect(page.locator(enabled ? '#switch-on' : '#switch-off')).toBeChecked();
}

async function signOut(page: Page): Promise<void> {
  await page.getByRole('link', { name: 'Sign out', exact: true }).click();
  await expect(page).toHaveURL(/\/sign-in$/);
}

async function enableSwitchAndSignOut(page: Page): Promise<void> {
  await loginAsServiceManager(page);
  await openSwitch(page);
  await expect(page.locator('#switch-off')).toBeChecked();
  await setSwitch(page, true);
  await signOut(page);
}

const test = base.extend<{ restoreSwitch: void }>({
  restoreSwitch: [async ({ browser, baseURL }, use) => {
    test.skip(baseURL !== environmentUrls.dev.adminBaseUrl && baseURL !== environmentUrls.test.adminBaseUrl,
      'Emergency switch tests run only against dev and test.');
    const context = await browser.newContext({ baseURL, storageState: { cookies: [], origins: [] } });
    try {
      const manager = await context.newPage();
      await loginAsServiceManager(manager);
      await openSwitch(manager);
      await expect(manager.locator('#switch-off'), 'The emergency switch must be off before running these tests').toBeChecked();
      await signOut(manager);
      try {
        await use();
      } finally {
        await loginAsServiceManager(manager);
        await openSwitch(manager);
        if (await manager.locator('#switch-on').isChecked()) {
          await setSwitch(manager, false);
        }
        await expect(manager.locator('#switch-off')).toBeChecked();
      }
    } finally {
      await context.close();
    }
  }, { auto: true, timeout: 90_000 }],
});

test.describe('Emergency off-switch', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test('shows the emergency holding page when a teacher signs in while enabled', async ({ page }) => {
    await enableSwitchAndSignOut(page);
    await signIn(page, TEACHER_CREDENTIALS.username, TEACHER_CREDENTIALS.password);
    await expect(page.getByRole('heading', { name: holdingPageHeading, exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { name: /Manage the multiplication tables check for/ })).toHaveCount(0);
    await signOut(page);
  });

  test('shows the emergency holding page when a pupil signs in with generated credentials', async ({ page, baseURL }) => {
    test.setTimeout(120_000);
    const pupilBaseUrl = baseURL === environmentUrls.dev.adminBaseUrl
      ? environmentUrls.dev.pupilBaseUrl
      : environmentUrls.test.pupilBaseUrl;

    await signIn(page, TEACHER_CREDENTIALS.username, TEACHER_CREDENTIALS.password);
    await expect(page).toHaveURL(/\/school\/school-home$/);
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Manage the multiplication tables check for');
    await page.getByRole('link', { name: 'Generate and view password and PINs for the try it out and official check', exact: true }).click();
    await page.getByRole('button', { name: 'Official check', exact: true }).click();
    const generatePinsName = 'Generate password and PINs for the official check';
    await page.getByRole('link', { name: generatePinsName, exact: true })
      .or(page.getByRole('button', { name: generatePinsName, exact: true })).click();
    const pupil = page.getByRole('checkbox', { name: /Tick pupil/i }).first();
    const pupilId = await pupil.inputValue();
    await pupil.check();
    await page.getByRole('button', { name: 'Confirm', exact: true }).click();
    await expect(page).toHaveURL(/\/pupil-pin\/view-and-custom-print-live-pins$/);

    const rowText = await page.locator(`#generatePins tr.pupil-${pupilId}`).innerText();
    const schoolPassword = rowText.match(/School Password:\s*([A-Za-z0-9]+)/i)?.[1];
    const pupilPin = rowText.match(/PIN:\s*(\d+)/i)?.[1];
    if (!schoolPassword || !pupilPin) {
      throw new Error('Generated pupil credentials were not present on the PIN page.');
    }
    await signOut(page);

    await enableSwitchAndSignOut(page);
    await page.goto(`${pupilBaseUrl}/sign-in`);
    await page.getByLabel('School password', { exact: true }).fill(schoolPassword);
    await page.getByLabel('PIN', { exact: true }).fill(pupilPin);
    const authResponse = page.waitForResponse(response =>
      new URL(response.url()).pathname === '/auth' && response.request().method() === 'POST'
    );
    await page.getByRole('button', { name: 'Sign in', exact: true }).click();
    const response = await authResponse;
    expect(response.status()).toBe(503);
    expect((await response.json()).code).toBe('EMERGENCY_OFF_SWITCH_ENABLED');
    await expect(page).toHaveURL(`${baseURL}/emergency-off-switch-service-unavailable?source=pupil`);
    await expect(page.getByRole('heading', { name: holdingPageHeading, exact: true })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Sign out', exact: true })).toHaveCount(0);
  });
});
