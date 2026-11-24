import { expect, type Page } from '@playwright/test';

const serviceManager = { username: 'service-manager', password: 'password' };
const teacher = { username: 'teacher5', password: 'password' };
const seededSchoolDfeNumber = '2011005';
const dateFields = [
  'adminStart',
  'adminEnd',
  'familiarisationCheckStart',
  'familiarisationCheckEnd',
  'liveCheckStart',
  'liveCheckEnd',
] as const;

type DateParts = { day: string; month: string; year: string };
type CheckWindow = Record<typeof dateFields[number], DateParts>;

function dateParts(date: Date): DateParts {
  return {
    day: String(date.getDate()).padStart(2, '0'),
    month: String(date.getMonth() + 1).padStart(2, '0'),
    year: String(date.getFullYear()),
  };
}

function offsetDate(days: number, baseDate = new Date()): DateParts {
  const date = new Date(baseDate);
  date.setDate(date.getDate() + days);
  return dateParts(date);
}

function requiredHdfSchoolDfeNumber(): string {
  const dfeNumber = process.env.SUPERUSER_HDF_SCHOOL_DFE_NUMBER;
  if (!dfeNumber) {
    throw new Error('Set SUPERUSER_HDF_SCHOOL_DFE_NUMBER=2011005 before running the local HDF tests.');
  }
  if (dfeNumber !== seededSchoolDfeNumber) {
    throw new Error(`The local HDF setup uses seeded teacher5 for school ${seededSchoolDfeNumber}; set SUPERUSER_HDF_SCHOOL_DFE_NUMBER to the same value.`);
  }
  return dfeNumber;
}

async function login(page: Page, username: string, password: string): Promise<void> {
  await page.goto('/sign-in');
  const cookieButton = page.getByRole('button', { name: 'Accept all cookies', exact: true });
  if (await cookieButton.isVisible()) {
    await cookieButton.click();
  }
  await page.getByRole('textbox', { name: 'Enter your user name.', exact: true }).fill(username);
  await page.getByLabel('Enter your password.', { exact: true }).fill(password);
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await expect(page).toHaveURL(username === serviceManager.username ? /\/service-manager\/home$/ : /\/school\/school-home$/);
  if (await cookieButton.isVisible()) {
    await cookieButton.click();
  }
}

async function logout(page: Page): Promise<void> {
  const signOut = page.getByRole('button', { name: 'Sign out', exact: true });
  if (await signOut.count()) {
    await signOut.first().click();
    return;
  }
  await page.getByRole('link', { name: 'Sign out', exact: true }).click();
}

async function openHdfStatus(page: Page, dfeNumber: string): Promise<void> {
  await page.getByRole('link', { name: 'Manage organisations', exact: true }).click();
  await page.getByRole('link', { name: 'Search for an existing organisation', exact: true }).click();
  await page.locator('#q').fill(dfeNumber);
  await page.getByRole('button', { name: 'Search', exact: true }).click();
  await expect(page).toHaveURL(/\/service-manager\/organisations\/[^/]+$/);
  await expect(page.locator('.govuk-summary-list__row')
    .filter({ has: page.locator('dt').filter({ hasText: /^\s*DFE Number\s*$/ }) })
    .locator('dd')).toHaveText(dfeNumber);
  await page.getByRole('link', { name: 'Manage HDF Submission', exact: true }).click();
  await expect(page).toHaveURL(/\/service-manager\/organisations\/.*\/hdfstatus$/);
}

async function deleteHdfIfPresent(page: Page, dfeNumber: string): Promise<void> {
  await openHdfStatus(page, dfeNumber);
  const deleteButton = page.getByRole('button', { name: 'Delete Submission', exact: true });
  if (await deleteButton.isVisible()) {
    await deleteButton.click();
    const confirmation = page.getByRole('button', { name: /confirm|yes|delete/i }).first();
    if (await confirmation.isVisible({ timeout: 2000 }).catch(() => false)) {
      await confirmation.click();
    }
    await expect(page).toHaveURL(/\/service-manager\/organisations\/.*\/hdfstatus$/);
    await expect(deleteButton).not.toBeVisible();
  }
}

async function setDateFields(page: Page, values: Partial<CheckWindow>): Promise<void> {
  for (const [prefix, date] of Object.entries(values)) {
    const dayField = page.locator(`#${prefix}Day`);
    if (await dayField.count() === 0 && prefix.endsWith('Start')) {
      continue;
    }
    await expect(dayField, `Expected editable ${prefix} date fields on the check-window form`).toBeVisible();
    await dayField.fill(date.day);
    await page.locator(`#${prefix}Month`).fill(date.month);
    await page.locator(`#${prefix}Year`).fill(date.year);
  }
}

async function saveCheckWindow(page: Page): Promise<void> {
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  const overrideWarnings = page.getByRole('checkbox', { name: /Override the warnings on this screen\.?/i });
  if (await overrideWarnings.isVisible({ timeout: 1500 }).catch(() => false)) {
    await overrideWarnings.check();
    await page.getByRole('button', { name: 'Save', exact: true }).click();
  }
  const errors = page.locator('.govuk-error-summary');
  if (await errors.isVisible({ timeout: 1000 }).catch(() => false)) {
    throw new Error(`Unable to save check-window dates: ${await errors.innerText()}`);
  }
}

async function setCheckWindow(page: Page, values: Partial<CheckWindow>): Promise<void> {
  await page.goto('/check-window/manage-check-windows');
  await expect(page.getByRole('heading', { name: 'Manage check windows' })).toBeVisible();
  await page.getByRole('link', { name: 'Development Phase', exact: true }).click();
  await setDateFields(page, values);
  await saveCheckWindow(page);
}

async function verifyCheckWindowDates(page: Page, expected: Partial<CheckWindow>): Promise<boolean> {
  await page.goto('/check-window/manage-check-windows');
  await expect(page.getByRole('heading', { name: 'Manage check windows' })).toBeVisible();
  await page.getByRole('link', { name: 'Development Phase', exact: true }).click();
  for (const [prefix, date] of Object.entries(expected)) {
    const dayField = page.locator(`#${prefix}Day`);
    if (await dayField.count() === 0) {
      return false;
    }
    for (const part of ['Day', 'Month', 'Year'] as const) {
      const actual = await page.locator(`#${prefix}${part}`).inputValue();
      const expectedPart = date[part.toLowerCase() as keyof DateParts];
      if (Number(actual) !== Number(expectedPart)) {
        return false;
      }
    }
  }
  return true;
}

async function configureCheckWindowForHdf(page: Page): Promise<void> {
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    const baseDate = new Date();
    const expected = {
      liveCheckEnd: offsetDate(-1, baseDate),
      adminEnd: offsetDate(21, baseDate),
    };
    await setCheckWindow(page, {
      adminStart: offsetDate(-35, baseDate),
      familiarisationCheckStart: offsetDate(-21, baseDate),
      liveCheckStart: offsetDate(-14, baseDate),
      familiarisationCheckEnd: expected.liveCheckEnd,
      liveCheckEnd: expected.liveCheckEnd,
      adminEnd: expected.adminEnd,
    });
    if (await verifyCheckWindowDates(page, expected)) {
      return;
    }
  }
  throw new Error('Unable to persist check-window dates for HDF signing after 3 attempts.');
}

async function restoreCheckWindowToOpen(page: Page): Promise<void> {
  const baseDate = new Date();
  await setCheckWindow(page, {
    adminStart: offsetDate(-60, baseDate),
    familiarisationCheckStart: offsetDate(-45, baseDate),
    liveCheckStart: offsetDate(-30, baseDate),
    familiarisationCheckEnd: offsetDate(30, baseDate),
    liveCheckEnd: offsetDate(30, baseDate),
    adminEnd: offsetDate(60, baseDate),
  });
}

async function submitHdf(page: Page): Promise<void> {
  await login(page, teacher.username, teacher.password);
  await page.goto('/attendance/declaration-form');
  await expect(page.getByRole('heading', { name: /Headteacher.?s declaration form/i })).toBeVisible();
  await expect.poll(async () => {
    await page.reload();
    return page.getByText('Currently unavailable').count();
  }, {
    timeout: 45_000,
    intervals: [1000, 2000, 3000],
    message: 'HDF remained unavailable after check-window update.',
  }).toBe(0);

  await page.getByLabel("Submitter's first name").fill('Test');
  await page.getByLabel("Submitter's last name").fill('Automation Local Setup');
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Review pupil details' })).toBeVisible();
  await page.getByRole('link', { name: 'Continue', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Confirm and submit' })).toBeVisible();
  await page.locator('#confirmAll').check();
  await Promise.all([
    page.waitForURL(/\/attendance\/submitted/),
    page.getByRole('button', { name: 'Submit', exact: true }).click(),
  ]);
  await expect(page.getByRole('heading', { name: /Headteacher.?s declaration form submitted/i })).toBeVisible();
}

export async function prepareLocalHdf(page: Page): Promise<void> {
  const dfeNumber = requiredHdfSchoolDfeNumber();
  await login(page, serviceManager.username, serviceManager.password);
  await deleteHdfIfPresent(page, dfeNumber);
  await configureCheckWindowForHdf(page);
  await logout(page);
  await submitHdf(page);
}

export async function cleanupLocalHdf(page: Page): Promise<void> {
  const dfeNumber = requiredHdfSchoolDfeNumber();
  await login(page, serviceManager.username, serviceManager.password);
  try {
    await deleteHdfIfPresent(page, dfeNumber);
  } finally {
    await restoreCheckWindowToOpen(page);
    await logout(page);
  }
}
