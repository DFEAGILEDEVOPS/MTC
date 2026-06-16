import { test, expect, type Page, type TestInfo } from '@playwright/test';
import { environmentUrls } from './playwright.config';

type EnvironmentName = keyof typeof environmentUrls;
type DateParts = { day: string; month: string; year: string };
type CheckWindowSnapshot = Record<string, DateParts | null>;

const SERVICE_MANAGER_CREDENTIALS = {
  username: 'service-manager',
  password: 'password',
} as const;

const TEACHER_CREDENTIALS = {
  username: 'teacher1',
  password: 'password',
} as const;

const CHECK_WINDOW_FIELD_PREFIXES = [
  'adminStart',
  'adminEnd',
  'familiarisationCheckStart',
  'familiarisationCheckEnd',
  'liveCheckStart',
  'liveCheckEnd',
] as const;

function getEnvironmentUrls(testInfo: TestInfo): { env: EnvironmentName; adminBaseUrl: string; pupilBaseUrl: string } {
  const env = testInfo.project.name.split('-')[0] as EnvironmentName;
  const urls = environmentUrls[env];

  if (!urls) {
    throw new Error(`Unsupported Playwright project name '${testInfo.project.name}'. Expected one of: dev-*, test-*, preprod-*.`);
  }

  return { env, ...urls };
}

function toDateParts(date: Date): DateParts {
  return {
    day: String(date.getDate()).padStart(2, '0'),
    month: String(date.getMonth() + 1).padStart(2, '0'),
    year: String(date.getFullYear()),
  };
}

function addDays(baseDate: Date, days: number): Date {
  const date = new Date(baseDate);
  date.setDate(date.getDate() + days);
  return date;
}

function normaliseDatePart(value: string): string {
  const trimmed = value.trim();
  if (trimmed === '') {
    return '';
  }
  return String(Number(trimmed));
}

async function dismissCookieBanner(page: Page): Promise<void> {
  const acceptCookiesButton = page.getByRole('button', { name: 'Accept all cookies' });
  if (await acceptCookiesButton.isVisible({ timeout: 3000 }).catch(() => false)) {
    await acceptCookiesButton.click();
  }
}

async function getSignedInUsername(page: Page): Promise<string | null> {
  const signedInAs = page.locator('text=/Signed in as/i').first();
  if (!await signedInAs.isVisible({ timeout: 1200 }).catch(() => false)) {
    return null;
  }

  const text = (await signedInAs.innerText().catch(() => '')).trim();
  const match = text.match(/Signed in as\s+(.+)$/i);
  return match?.[1]?.trim() || null;
}

async function loginAsAdmin(page: Page, adminBaseUrl: string, username: string, password: string): Promise<void> {
  // Always reset auth state to prevent role/session carry-over between service-manager and teacher logins.
  await page.goto(`${adminBaseUrl}/sign-out`).catch(() => undefined);
  await page.goto(`${adminBaseUrl}/sign-in`);
  await dismissCookieBanner(page);

  const currentUser = await getSignedInUsername(page);
  if (currentUser && currentUser.toLowerCase() !== username.toLowerCase()) {
    await logoutFromAdmin(page);
    await page.goto(`${adminBaseUrl}/sign-in`);
    await dismissCookieBanner(page);
  }

  const userNameField = page.getByRole('textbox', { name: 'Enter your user name.' });
  if (await userNameField.isVisible({ timeout: 2500 }).catch(() => false)) {
    await userNameField.fill(username);
    await page.getByRole('textbox', { name: 'Enter your password.' }).fill(password);
    await page.getByRole('button', { name: 'Sign in' }).click();
  }

  await expect(page).toHaveURL(/admin|multiplication-tables-check\.service\.gov\.uk/);

  const signInPathMatch = page.url().match(/\/sign-in(?:\?|$)/i);
  const signInFieldVisible = await page.getByRole('textbox', { name: 'Enter your user name.' }).isVisible({ timeout: 1000 }).catch(() => false);

  if (signInPathMatch || signInFieldVisible) {
    throw new Error(`Login appears unsuccessful for user '${username}'. Current URL: ${page.url()}`);
  }

  const signedInAs = await getSignedInUsername(page);
  if (signedInAs && signedInAs.toLowerCase() !== username.toLowerCase()) {
    throw new Error(`Login user mismatch: expected ${username}, got ${signedInAs}`);
  }
  await dismissCookieBanner(page);
}

async function logoutFromAdmin(page: Page): Promise<void> {
  const signOutButton = page.getByRole('button', { name: 'Sign out' });
  if (await signOutButton.count()) {
    await signOutButton.first().click();
  } else {
    await page.getByRole('link', { name: 'Sign out' }).click();
  }
}

async function openCheckWindow(page: Page, env: EnvironmentName): Promise<void> {
  const checkWindowName = env === 'dev' ? 'testing 2026' : 'Development Phase';
  const checkWindowLink = page.getByRole('link', { name: checkWindowName, exact: true });
  await expect(checkWindowLink).toBeVisible();
  await checkWindowLink.click();
}

async function fillDateFieldIfVisible(page: Page, fieldPrefix: string, date: DateParts): Promise<void> {
  const dayField = page.locator(`#${fieldPrefix}Day`);
  const monthField = page.locator(`#${fieldPrefix}Month`);
  const yearField = page.locator(`#${fieldPrefix}Year`);

  const isVisible = await dayField.isVisible().catch(() => false);
  if (!isVisible) {
    return;
  }

  await dayField.fill(date.day);
  await monthField.fill(date.month);
  await yearField.fill(date.year);
}

async function getDateFieldValueIfVisible(page: Page, fieldPrefix: string): Promise<DateParts | null> {
  const dayField = page.locator(`#${fieldPrefix}Day`);
  const monthField = page.locator(`#${fieldPrefix}Month`);
  const yearField = page.locator(`#${fieldPrefix}Year`);

  const isVisible = await dayField.isVisible().catch(() => false);
  if (!isVisible) {
    return null;
  }

  return {
    day: (await dayField.inputValue()).trim(),
    month: (await monthField.inputValue()).trim(),
    year: (await yearField.inputValue()).trim(),
  };
}

async function takeCheckWindowSnapshot(page: Page): Promise<CheckWindowSnapshot> {
  const snapshot: CheckWindowSnapshot = {};
  for (const prefix of CHECK_WINDOW_FIELD_PREFIXES) {
    snapshot[prefix] = await getDateFieldValueIfVisible(page, prefix);
  }
  return snapshot;
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

async function configureCheckWindowForHdfSigning(page: Page): Promise<void> {
  const now = new Date();

  const adminStartDate = toDateParts(addDays(now, -35));
  const familiarisationStartDate = toDateParts(addDays(now, -21));
  const liveStartDate = toDateParts(addDays(now, -14));
  const checkEndDate = toDateParts(addDays(now, -1));
  const adminEndDate = toDateParts(addDays(now, 21));

  // Target state: check window is over, but still in admin period so reasons can be set and HDF can be signed.
  await fillDateFieldIfVisible(page, 'adminStart', adminStartDate);
  await fillDateFieldIfVisible(page, 'familiarisationCheckStart', familiarisationStartDate);
  await fillDateFieldIfVisible(page, 'liveCheckStart', liveStartDate);
  await fillDateFieldIfVisible(page, 'familiarisationCheckEnd', checkEndDate);
  await fillDateFieldIfVisible(page, 'liveCheckEnd', checkEndDate);
  await fillDateFieldIfVisible(page, 'adminEnd', adminEndDate);

  await saveCheckWindowForm(page, 'save check-window setup for HDF signing');
}

async function restoreCheckWindowFromSnapshot(page: Page, snapshot: CheckWindowSnapshot): Promise<void> {
  for (const prefix of CHECK_WINDOW_FIELD_PREFIXES) {
    const originalDate = snapshot[prefix];
    if (!originalDate) {
      continue;
    }
    await fillDateFieldIfVisible(page, prefix, originalDate);
  }

  await saveCheckWindowForm(page, 'restore original check-window values');
}

async function assertCheckWindowRestored(page: Page, snapshot: CheckWindowSnapshot): Promise<void> {
  const mismatches: string[] = [];

  for (const prefix of CHECK_WINDOW_FIELD_PREFIXES) {
    const expected = snapshot[prefix];
    if (!expected) {
      continue;
    }

    const actual = await getDateFieldValueIfVisible(page, prefix);
    if (!actual) {
      continue;
    }

    const expectedDay = normaliseDatePart(expected.day);
    const expectedMonth = normaliseDatePart(expected.month);
    const expectedYear = normaliseDatePart(expected.year);
    const actualDay = normaliseDatePart(actual.day);
    const actualMonth = normaliseDatePart(actual.month);
    const actualYear = normaliseDatePart(actual.year);

    if (expectedDay !== actualDay || expectedMonth !== actualMonth || expectedYear !== actualYear) {
      mismatches.push(
        `${prefix}: expected ${expected.day}/${expected.month}/${expected.year}, got ${actual.day}/${actual.month}/${actual.year}`
      );
    }
  }

  if (mismatches.length > 0) {
    throw new Error(`Check window cleanup verification failed. Fields not restored: ${mismatches.join(' | ')}`);
  }
}

test('teacher can access HDF and reach the confirm step when all prerequisites are satisfied', async ({ page }, testInfo) => {
  const { env, adminBaseUrl } = getEnvironmentUrls(testInfo);

  test.skip(env === 'preprod', 'Preprod uses DfE Sign-in (OAuth) and this setup flow depends on username/password roles.');

  test.setTimeout(8 * 60 * 1000);

  let originalCheckWindow: CheckWindowSnapshot | null = null;

  try {
    // 1) Service-manager adjusts check window so the school is in the post-check admin period.
    await loginAsAdmin(page, adminBaseUrl, SERVICE_MANAGER_CREDENTIALS.username, SERVICE_MANAGER_CREDENTIALS.password);
    await page.goto('/check-window/manage-check-windows');
    await expect(page.getByRole('heading', { name: 'Manage check windows' })).toBeVisible();
    await openCheckWindow(page, env);
    originalCheckWindow = await takeCheckWindowSnapshot(page);
    await configureCheckWindowForHdfSigning(page);
    await logoutFromAdmin(page);

    // 2) Teacher can access HDF and reach the final confirmation step in a preconditioned environment.
    await loginAsAdmin(page, adminBaseUrl, TEACHER_CREDENTIALS.username, TEACHER_CREDENTIALS.password);
    await page.goto('/attendance/declaration-form');
    await dismissCookieBanner(page);

    await expect(page.getByRole('heading', { name: /Headteacher.?s declaration form/i })).toBeVisible();
    await expect(page.getByText('Currently unavailable')).toHaveCount(0);

    await page.getByLabel("Submitter's first name").fill('Test');
    await page.getByLabel("Submitter's last name").fill('Automation');
    await page.getByRole('button', { name: 'Continue' }).click();

    await expect(page.getByRole('heading', { name: 'Review pupil details' })).toBeVisible();
    await page.getByRole('link', { name: 'Continue' }).click();

    await expect(page.getByRole('heading', { name: 'Confirm and submit' })).toBeVisible();
    await expect(page.locator('#confirmAll')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Submit' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Submit' })).toBeEnabled();
  } finally {
    if (originalCheckWindow) {
      await loginAsAdmin(page, adminBaseUrl, SERVICE_MANAGER_CREDENTIALS.username, SERVICE_MANAGER_CREDENTIALS.password);
      await page.goto('/check-window/manage-check-windows');
      await expect(page.getByRole('heading', { name: 'Manage check windows' })).toBeVisible();
      await openCheckWindow(page, env);
      await restoreCheckWindowFromSnapshot(page, originalCheckWindow);
      await assertCheckWindowRestored(page, originalCheckWindow);
    }

    await logoutFromAdmin(page).catch(() => undefined);
  }
});
