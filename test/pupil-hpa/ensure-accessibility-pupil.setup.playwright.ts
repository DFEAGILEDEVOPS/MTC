import { test, expect, type Page, type TestInfo } from '@playwright/test';
import fs from 'node:fs/promises';
import path from 'node:path';
import { environmentUrls } from './playwright.config';

type EnvironmentName = keyof typeof environmentUrls;

type AccessibilitySetupState = {
  env: EnvironmentName;
  upn: string;
  firstName: string;
  lastName: string;
  /** "Lastname, Firstname" format as used by the admin pupil name displays */
  fullName: string;
  createdAtUtcIso: string;
};

const TEACHER_CREDENTIALS = {
  username: process.env.ADMIN_USERNAME ?? 'teacher2',
  password: process.env.ADMIN_PASSWORD ?? 'password',
};

const SERVICE_MANAGER_CREDENTIALS = {
  username: 'service-manager',
  password: 'password',
};

const ACCESSIBILITY_SETUP_PUPIL = {
  firstName: 'AA',
  lastName: 'AAAASetupPupil',
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

async function loginAsTeacher(page: Page, adminBaseUrl: string): Promise<void> {
  await page.goto(`${adminBaseUrl}/sign-in`);
  await dismissCookieBanner(page);

  const userNameField = page.getByRole('textbox', { name: 'Enter your user name.' });
  if (await userNameField.isVisible({ timeout: 2500 }).catch(() => false)) {
    await userNameField.fill(TEACHER_CREDENTIALS.username);
    await page.getByRole('textbox', { name: 'Enter your password.' }).fill(TEACHER_CREDENTIALS.password);
    await page.getByRole('button', { name: 'Sign in' }).click();
  }

  await expect(page).toHaveURL(/admin|multiplication-tables-check\.service\.gov\.uk/);
  await dismissCookieBanner(page);
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

  await saveCheckWindowForm(page, 'restore check-window to open state for accessibility setup');
}

async function logoutFromAdmin(page: Page, adminBaseUrl: string): Promise<void> {
  await page.goto(`${adminBaseUrl}/sign-out`).catch(() => undefined);
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
    throw new Error('Add pupil is disabled for the current role or check-window phase. Accessibility setup cannot create the prerequisite pupil.');
  }
}

async function addPupil(page: Page, adminBaseUrl: string, upn: string): Promise<void> {
  const dob = getValidDob();
  await page.goto(`${adminBaseUrl}/pupil-register/pupil/add`);

  await expect(page.getByRole('heading', { name: 'Add pupil' })).toBeVisible();

  await page.locator('#foreName').fill(ACCESSIBILITY_SETUP_PUPIL.firstName);
  await page.locator('#lastName').fill(ACCESSIBILITY_SETUP_PUPIL.lastName);
  await page.locator('#upn').fill(upn);
  await page.locator('#dob-day').fill(dob.day);
  await page.locator('#dob-month').fill(dob.month);
  await page.locator('#dob-year').fill(dob.year);
  await page.locator('#gender-female').check();

  await page.getByRole('button', { name: 'Add pupil', exact: true }).click();

  await expect(page).toHaveURL(/\/pupil-register\/pupils-list/);
  await expect(page.getByText(/new pupil has been added/i)).toBeVisible();
  await expect(page.locator('body')).toContainText(upn);
  const createdPupilLinks = page.getByRole('link', {
    name: new RegExp(`${ACCESSIBILITY_SETUP_PUPIL.lastName},\\s*${ACCESSIBILITY_SETUP_PUPIL.firstName}`, 'i'),
  });
  expect(await createdPupilLinks.count()).toBeGreaterThan(0);
}

async function assignColourContrastAccessArrangement(page: Page, adminBaseUrl: string, firstName: string, lastName: string): Promise<void> {
  // Navigate via the 'Enable access arrangements' overview page, matching the manual flow
  await page.goto(`${adminBaseUrl}/access-arrangements/overview`);
  await expect(page.getByRole('heading', { name: /Enable access arrangements for pupils who need them/i })).toBeVisible();

  await page
    .getByRole('link', { name: /View pupils and assign arrangements/i })
    .or(page.getByRole('button', { name: /View pupils and assign arrangements/i }))
    .or(page.getByRole('link', { name: /select pupils and access arrangements/i }))
    .first()
    .click();

  await expect(page).toHaveURL(/access-arrangements\/select-access-arrangements/);

  // Check the 'Colour contrast' checkbox
  const accessArrangementsList = page.locator('ul#accessArrangementsList li');
  await expect(accessArrangementsList.first()).toBeVisible({ timeout: 10000 });
  const listItemCount = await accessArrangementsList.count();

  let foundColourContrast = false;
  for (let i = 0; i < listItemCount; i++) {
    const item = accessArrangementsList.nth(i);
    const itemText = await item.textContent({ timeout: 2000 }).catch(() => '');

    if (itemText && /colour contrast/i.test(itemText)) {
      const checkbox = item.locator('input[type="checkbox"]').first();
      if (!(await checkbox.isChecked().catch(() => false))) {
        await checkbox.check();
      }
      foundColourContrast = true;
      break;
    }
  }

  if (!foundColourContrast) {
    throw new Error('Could not find Colour contrast option in access arrangements list');
  }

  // Select the newly created pupil from the dropdown
  const pupilSelect = page.locator('select#pupil-autocomplete-container');
  await expect(pupilSelect).toBeVisible({ timeout: 5000 });

  const matchingOption = pupilSelect.locator('option').filter({
    hasText: new RegExp(`${lastName}.*${firstName}|${firstName}.*${lastName}`, 'i'),
  }).first();

  const optionValue = await matchingOption.getAttribute('value').catch(() => null);
  if (!optionValue) {
    throw new Error(`Could not find pupil option matching '${lastName}, ${firstName}' in access arrangements dropdown`);
  }

  const selectVisible = await pupilSelect.isVisible().catch(() => false);
  if (selectVisible) {
    await pupilSelect.selectOption(optionValue);
  } else {
    await page.evaluate(({ value }) => {
      const select = document.querySelector<HTMLSelectElement>('select#pupil-autocomplete-container');
      if (!select) {
        throw new Error('Pupil select control was not found in the DOM.');
      }

      select.value = value;
      select.dispatchEvent(new Event('input', { bubbles: true }));
      select.dispatchEvent(new Event('change', { bubbles: true }));
    }, { value: optionValue });
  }

  // Save
  await page.locator('button#save-access-arrangement').click();
  await expect(page).toHaveURL(/access-arrangements\/overview/, { timeout: 15000 });
}

async function writeAccessibilitySetupState(state: AccessibilitySetupState): Promise<void> {
  const outputDir = path.resolve(process.cwd(), 'test-results');
  const outputPath = path.join(outputDir, `accessibility-setup-state-${state.env}.json`);
  await fs.mkdir(outputDir, { recursive: true });
  await fs.writeFile(outputPath, `${JSON.stringify(state, null, 2)}\n`, { encoding: 'utf8' });
}

test('create pupil with colour contrast access arrangement for accessibility check', async ({ page }, testInfo) => {
  test.skip(!testInfo.project.name.endsWith('-accessibility-setup'), 'Setup runs only in *-accessibility-setup projects.');

  const { env, adminBaseUrl } = getEnvironmentUrls(testInfo);

  if (env === 'preprod' && (TEACHER_CREDENTIALS.username === 'teacher2' || TEACHER_CREDENTIALS.password === 'password')) {
    throw new Error('Preprod requires real credentials. Provide ADMIN_USERNAME and ADMIN_PASSWORD env vars.');
  }

  test.setTimeout(5 * 60 * 1000);

  // 0) Normalise shared state so setup does not depend on ambient check-window settings.
  await ensureCheckWindowOpenForSetup(page, adminBaseUrl);

  // 1) Sign in as teacher
  await loginAsTeacher(page, adminBaseUrl);

  // 2) Add a new pupil to the pupil register
  await assertCanAddPupil(page, adminBaseUrl);
  const seed = `${Date.now()}${Math.floor(Math.random() * 100000)}`;
  const generatedUpn = generateUniqueUpn(seed);
  await addPupil(page, adminBaseUrl, generatedUpn);

  // 3) Assign colour contrast access arrangement to the new pupil
  await assignColourContrastAccessArrangement(
    page,
    adminBaseUrl,
    ACCESSIBILITY_SETUP_PUPIL.firstName,
    ACCESSIBILITY_SETUP_PUPIL.lastName,
  );

  // 4) Write state for the accessibility test to consume
  await writeAccessibilitySetupState({
    env,
    upn: generatedUpn,
    firstName: ACCESSIBILITY_SETUP_PUPIL.firstName,
    lastName: ACCESSIBILITY_SETUP_PUPIL.lastName,
    fullName: `${ACCESSIBILITY_SETUP_PUPIL.lastName}, ${ACCESSIBILITY_SETUP_PUPIL.firstName}`,
    createdAtUtcIso: new Date().toISOString(),
  });
});
