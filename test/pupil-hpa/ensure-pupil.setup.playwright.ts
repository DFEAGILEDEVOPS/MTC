import { test, expect, type Page, type TestInfo } from '@playwright/test';
import fs from 'node:fs/promises';
import path from 'node:path';
import { environmentUrls } from './playwright.config';

type EnvironmentName = keyof typeof environmentUrls;

type SetupState = {
  env: EnvironmentName;
  upn: string;
  firstName: string;
  lastName: string;
  generatedBy: string;
  createdBy: string;
  createdAtUtcIso: string;
};

const TEST_DEVELOPER_CREDENTIALS = {
  username: 'test-developer',
  password: 'password',
};

const TEACHER_CREDENTIALS = {
  username: process.env.ADMIN_USERNAME ?? 'teacher2',
  password: process.env.ADMIN_PASSWORD ?? 'password',
};

const SERVICE_MANAGER_CREDENTIALS = {
  username: 'service-manager',
  password: 'password',
};

const UPN_REMAINDER_LOOKUP: Record<number, string> = {
  0: 'A',
  1: 'B',
  2: 'C',
  3: 'D',
  4: 'E',
  5: 'F',
  6: 'G',
  7: 'H',
  8: 'J',
  9: 'K',
  10: 'L',
  11: 'M',
  12: 'N',
  13: 'P',
  14: 'Q',
  15: 'R',
  16: 'T',
  17: 'U',
  18: 'V',
  19: 'W',
  20: 'X',
  21: 'Y',
  22: 'Z',
};

function getEnvironmentUrls(testInfo: TestInfo): { env: EnvironmentName; adminBaseUrl: string; pupilBaseUrl: string } {
  const env = testInfo.project.name.split('-')[0] as EnvironmentName;
  const urls = environmentUrls[env];

  if (!urls) {
    throw new Error(`Unsupported Playwright project name '${testInfo.project.name}'.`);
  }

  return { env, ...urls };
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

function calculateCheckLetter(tail12Chars: string): string {
  const chars = [...tail12Chars];
  const multiplied = chars.map((char, index) => {
    const numericValue = Number.parseInt(char, 10);
    const characterPosition = index + 2;
    return Number.isInteger(numericValue) ? numericValue * characterPosition : 0;
  });
  const sum = multiplied.reduce((acc, item) => acc + item, 0);
  const remainder = sum % 23;
  return UPN_REMAINDER_LOOKUP[remainder] ?? 'A';
}

function generateUniqueUpn(seed: string): string {
  // Use a known LA code and a seed-derived serial for a stable 13-char UPN.
  const localAuthorityCode = '801';
  const serialDigits = seed.replace(/\D/g, '').slice(-8).padStart(8, '0');
  const suffixChar = '1';
  const tail = `${localAuthorityCode}${serialDigits}${suffixChar}`;
  const checkLetter = calculateCheckLetter(tail);
  return `${checkLetter}${tail}`;
}

function getValidDob(): { day: string; month: string; year: string } {
  const today = new Date();
  const year = today.getUTCFullYear();
  const month = today.getUTCMonth() + 1;
  const academicYear = month >= 1 && month <= 8 ? year - 1 : year;
  const dobYear = String(academicYear - 9);
  return { day: '15', month: '06', year: dobYear };
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

  await saveCheckWindowForm(page, 'restore check-window to open state for setup');
}

async function ensureCheckWindowOpenForSetup(page: Page, adminBaseUrl: string): Promise<void> {
  await loginAsAdmin(page, adminBaseUrl, SERVICE_MANAGER_CREDENTIALS.username, SERVICE_MANAGER_CREDENTIALS.password);
  await page.goto(`${adminBaseUrl}/check-window/manage-check-windows`);
  await expect(page.getByRole('heading', { name: 'Manage check windows' })).toBeVisible({ timeout: 10000 });
  await openCheckWindow(page);
  await restoreToOpenCheckWindow(page);
  await logoutFromAdmin(page, adminBaseUrl);
}

async function assertCanAddPupil(page: Page, adminBaseUrl: string): Promise<void> {
  await page.goto(`${adminBaseUrl}/pupil-register/pupils-list`);
  const addPupilButton = page
    .getByRole('button', { name: 'Add pupil', exact: true })
    .or(page.getByRole('link', { name: 'Add pupil', exact: true }))
    .first();
  await expect(addPupilButton).toBeVisible();

  const href = await addPupilButton.getAttribute('href');
  const isDisabled = await addPupilButton.getAttribute('aria-disabled');

  if (!href || href === '#' || isDisabled === 'true') {
    throw new Error('Add pupil is disabled for the current role or check-window phase.');
  }
}

async function addPupil(page: Page, adminBaseUrl: string, upn: string): Promise<void> {
  const dob = getValidDob();
  await page.goto(`${adminBaseUrl}/pupil-register/pupil/add`);

  await expect(page.getByRole('heading', { name: 'Add pupil' })).toBeVisible();

  await page.locator('#foreName').fill('PW');
  await page.locator('#lastName').fill('SetupPupil');
  await page.locator('#upn').fill(upn);
  await page.locator('#dob-day').fill(dob.day);
  await page.locator('#dob-month').fill(dob.month);
  await page.locator('#dob-year').fill(dob.year);
  await page.locator('#gender-female').check();

  await page.getByRole('button', { name: 'Add pupil', exact: true }).click();

  await expect(page).toHaveURL(/\/pupil-register\/pupils-list/);
  await expect(page.getByText(/new pupil has been added/i)).toBeVisible();
  await expect(page.locator('body')).toContainText(upn);
  const createdPupilLinks = page.getByRole('link', { name: /SetupPupil, PW/i });
  const createdPupilCount = await createdPupilLinks.count();
  expect(createdPupilCount).toBeGreaterThan(0);
}

async function writeSetupState(state: SetupState): Promise<void> {
  const outputDir = path.resolve(process.cwd(), 'test-results');
  const outputPath = path.join(outputDir, `setup-state-${state.env}.json`);
  await fs.mkdir(outputDir, { recursive: true });
  await fs.writeFile(outputPath, `${JSON.stringify(state, null, 2)}\n`, { encoding: 'utf8' });
}

test('ensure at least one newly added pupil exists before e2e run', async ({ page }, testInfo) => {
  test.skip(!testInfo.project.name.endsWith('-setup'), 'Setup runs only in *-setup projects.');

  const { env, adminBaseUrl } = getEnvironmentUrls(testInfo);

  // 0) Normalise shared state so setup does not depend on ambient check-window settings.
  await ensureCheckWindowOpenForSetup(page, adminBaseUrl);

  // 1) Login as test-developer to generate a unique UPN seed in the admin app context.
  await loginAsAdmin(page, adminBaseUrl, TEST_DEVELOPER_CREDENTIALS.username, TEST_DEVELOPER_CREDENTIALS.password);
  await page.goto(`${adminBaseUrl}/test-developer/home`);
  await expect(page.getByRole('heading', { name: /Multiplication tables check for test development/i })).toBeVisible();

  const seed = `${Date.now()}${Math.floor(Math.random() * 100000)}`;
  const generatedUpn = generateUniqueUpn(seed);

  // 2) Switch user to teacher and add pupil via pupil register.
  await logoutFromAdmin(page, adminBaseUrl);
  await loginAsAdmin(page, adminBaseUrl, TEACHER_CREDENTIALS.username, TEACHER_CREDENTIALS.password);
  await assertCanAddPupil(page, adminBaseUrl);
  await addPupil(page, adminBaseUrl, generatedUpn);

  // 3) Save setup state for downstream specs.
  await writeSetupState({
    env,
    upn: generatedUpn,
    firstName: 'PW',
    lastName: 'SetupPupil',
    generatedBy: TEST_DEVELOPER_CREDENTIALS.username,
    createdBy: TEACHER_CREDENTIALS.username,
    createdAtUtcIso: new Date().toISOString(),
  });
});
