import { test, expect, type Page, type TestInfo } from '@playwright/test';
import { environmentUrls } from './playwright.config';

type EnvironmentName = keyof typeof environmentUrls;

const SERVICE_MANAGER_CREDENTIALS = {
  username: 'service-manager',
  password: 'password',
};

function getEnvironmentUrls(testInfo: TestInfo): { env: EnvironmentName; adminBaseUrl: string } {
  const env = testInfo.project.name.split('-')[0] as EnvironmentName;
  const urls = environmentUrls[env];

  if (!urls) {
    throw new Error(`Unsupported Playwright project name '${testInfo.project.name}'.`);
  }

  return { env, adminBaseUrl: urls.adminBaseUrl };
}

async function dismissCookieBanner(page: Page): Promise<void> {
  const acceptCookiesButton = page.getByRole('button', { name: 'Accept all cookies' });
  if (await acceptCookiesButton.isVisible({ timeout: 2500 }).catch(() => false)) {
    await acceptCookiesButton.click();
  }
}

async function loginAsAdmin(page: Page, adminBaseUrl: string, username: string, password: string): Promise<void> {
  await page.goto(`${adminBaseUrl}/sign-in`);
  await dismissCookieBanner(page);

  const userNameField = page.getByRole('textbox', { name: 'Enter your user name.' });
  if (await userNameField.isVisible({ timeout: 2500 }).catch(() => false)) {
    await userNameField.fill(username);
    await page.getByRole('textbox', { name: 'Enter your password.' }).fill(password);
    await page.getByRole('button', { name: 'Sign in' }).click();
  }

  await expect(page).toHaveURL(/admin|multiplication-tables-check\.service\.gov\.uk/);
  await dismissCookieBanner(page);
}

async function logoutFromAdmin(page: Page, adminBaseUrl: string): Promise<void> {
  await page.goto(`${adminBaseUrl}/sign-out`).catch(() => undefined);
}

function toDateParts(date: Date): { day: string; month: string; year: string } {
  return {
    day: String(date.getDate()).padStart(2, '0'),
    month: String(date.getMonth() + 1).padStart(2, '0'),
    year: String(date.getFullYear()),
  };
}

function addDays(base: Date, days: number): Date {
  const next = new Date(base);
  next.setDate(next.getDate() + days);
  return next;
}

async function openCheckWindow(page: Page): Promise<void> {
  const checkWindowLink = page.getByRole('link', { name: 'Development Phase', exact: true });
  await expect(checkWindowLink).toBeVisible({ timeout: 10000 });
  await checkWindowLink.click();
}

async function fillDateFieldIfVisible(
  page: Page,
  fieldPrefix: string,
  date: { day: string; month: string; year: string }
): Promise<void> {
  const dayField = page.locator(`#${fieldPrefix}Day`);
  const monthField = page.locator(`#${fieldPrefix}Month`);
  const yearField = page.locator(`#${fieldPrefix}Year`);

  if (!await dayField.isVisible().catch(() => false)) {
    return;
  }

  await dayField.fill(date.day);
  await monthField.fill(date.month);
  await yearField.fill(date.year);
}

async function saveCheckWindowForm(page: Page, actionName: string): Promise<void> {
  await page.getByRole('button', { name: 'Save' }).click();

  const overrideWarnings = page.getByRole('checkbox', { name: /Override the warnings on this screen\.?/i });
  if (await overrideWarnings.isVisible({ timeout: 1500 }).catch(() => false)) {
    await overrideWarnings.check();
    await page.getByRole('button', { name: 'Save' }).click();
  }

  const errorSummary = page.locator('.govuk-error-summary');
  if (await errorSummary.isVisible({ timeout: 1000 }).catch(() => false)) {
    const summaryText = await errorSummary.innerText().catch(() => `Unknown validation error while trying to ${actionName}`);
    throw new Error(`Unable to ${actionName}: ${summaryText}`);
  }
}

async function restoreToOpenCheckWindow(page: Page): Promise<void> {
  const now = new Date();

  await fillDateFieldIfVisible(page, 'adminStart', toDateParts(addDays(now, -60)));
  await fillDateFieldIfVisible(page, 'familiarisationCheckStart', toDateParts(addDays(now, -45)));
  await fillDateFieldIfVisible(page, 'liveCheckStart', toDateParts(addDays(now, -30)));
  await fillDateFieldIfVisible(page, 'familiarisationCheckEnd', toDateParts(addDays(now, 30)));
  await fillDateFieldIfVisible(page, 'liveCheckEnd', toDateParts(addDays(now, 30)));
  await fillDateFieldIfVisible(page, 'adminEnd', toDateParts(addDays(now, 60)));

  await saveCheckWindowForm(page, 'restore check-window to open state in preflight');
}

test('normalise shared environment state before dependent flows', async ({ page }, testInfo) => {
  test.skip(!testInfo.project.name.endsWith('-preflight'), 'Preflight runs only on *-preflight projects.');

  const { env, adminBaseUrl } = getEnvironmentUrls(testInfo);

  if (env === 'preprod') {
    test.skip(true, 'Preprod preflight is not enabled for mutable shared-state flows.');
  }

  await loginAsAdmin(page, adminBaseUrl, SERVICE_MANAGER_CREDENTIALS.username, SERVICE_MANAGER_CREDENTIALS.password);
  await page.goto(`${adminBaseUrl}/check-window/manage-check-windows`);
  await expect(page.getByRole('heading', { name: 'Manage check windows' })).toBeVisible({ timeout: 10000 });
  await openCheckWindow(page);
  await restoreToOpenCheckWindow(page);
  await logoutFromAdmin(page, adminBaseUrl);
});
