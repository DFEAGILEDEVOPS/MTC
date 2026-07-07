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
  const checkWindowName = 'Development Phase';
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

function normalizeDatePart(value: string): string {
  const trimmed = value.trim();
  if (trimmed === '') {
    return '';
  }
  return String(Number(trimmed));
}

async function verifyDateFieldEquals(page: Page, fieldPrefix: string, expected: DateParts): Promise<boolean> {
  const actual = await getDateFieldValueIfVisible(page, fieldPrefix);
  if (!actual) {
    return false;
  }

  return (
    normalizeDatePart(actual.day) === normalizeDatePart(expected.day)
    && normalizeDatePart(actual.month) === normalizeDatePart(expected.month)
    && normalizeDatePart(actual.year) === normalizeDatePart(expected.year)
  );
}

async function configureCheckWindowForHdfSigningWithVerification(page: Page, env: EnvironmentName): Promise<void> {
  const now = new Date();
  const expectedLiveCheckEnd = toDateParts(addDays(now, -1));
  const expectedAdminEnd = toDateParts(addDays(now, 21));

  for (let attempt = 1; attempt <= 3; attempt += 1) {
    await page.goto('/check-window/manage-check-windows');
    await expect(page.getByRole('heading', { name: 'Manage check windows' })).toBeVisible();
    await openCheckWindow(page, env);

    await configureCheckWindowForHdfSigning(page);

    await page.goto('/check-window/manage-check-windows');
    await expect(page.getByRole('heading', { name: 'Manage check windows' })).toBeVisible();
    await openCheckWindow(page, env);

    const liveCheckEndMatches = await verifyDateFieldEquals(page, 'liveCheckEnd', expectedLiveCheckEnd);
    const adminEndMatches = await verifyDateFieldEquals(page, 'adminEnd', expectedAdminEnd);

    if (liveCheckEndMatches && adminEndMatches) {
      return;
    }
  }

  throw new Error('Unable to persist check-window dates for HDF signing after 3 attempts.');
}

async function waitForHdfToBecomeAvailable(page: Page): Promise<void> {
  await expect(page.getByRole('heading', { name: /Headteacher.?s declaration form/i })).toBeVisible();

  await expect.poll(
    async () => {
      await page.reload();
      await dismissCookieBanner(page);
      return page.getByText('Currently unavailable').count();
    },
    {
      timeout: 45_000,
      intervals: [1000, 2000, 3000],
      message: 'HDF remained unavailable after check-window update.',
    }
  ).toBe(0);
}

/**
 * Restores the check window to a known-good open state where both the familiarisation
 * and live check periods are currently active. This ensures subsequent tests (e.g. generate
 * live pins, accessibility check) are not blocked by a closed check window, regardless of
 * what state the window was in before this test ran.
 */
async function restoreToOpenCheckWindow(page: Page): Promise<void> {
  const now = new Date();

  await fillDateFieldIfVisible(page, 'adminStart', toDateParts(addDays(now, -60)));
  await fillDateFieldIfVisible(page, 'familiarisationCheckStart', toDateParts(addDays(now, -45)));
  await fillDateFieldIfVisible(page, 'liveCheckStart', toDateParts(addDays(now, -30)));
  await fillDateFieldIfVisible(page, 'familiarisationCheckEnd', toDateParts(addDays(now, 30)));
  await fillDateFieldIfVisible(page, 'liveCheckEnd', toDateParts(addDays(now, 30)));
  await fillDateFieldIfVisible(page, 'adminEnd', toDateParts(addDays(now, 60)));

  await saveCheckWindowForm(page, 'restore check-window to open state');
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

async function deleteSubmittedHdf(page: Page, adminBaseUrl: string): Promise<void> {
  await loginAsAdmin(page, adminBaseUrl, SERVICE_MANAGER_CREDENTIALS.username, SERVICE_MANAGER_CREDENTIALS.password);

  // Navigate to Manage organisations
  await page.getByRole('link', { name: 'Manage organisations' }).click();
  await expect(page.getByRole('heading', { name: 'Manage organisations' })).toBeVisible();

  // Click on 'Search for an existing organisation'
  await page.getByRole('link', { name: 'Search for an existing organisation' }).click();
  await expect(page.getByRole('heading', { name: 'Search organisations' })).toBeVisible();

  // Enter 89001 into the searchbar
  await page.locator('#q').fill('89001');

  // Click 'Search'
  await page.getByRole('button', { name: 'Search' }).click();

  // Click 'Manage HDF Submission' on the right-hand side navbar
  await expect(page.getByRole('link', { name: 'Manage HDF Submission' })).toBeVisible();
  await page.getByRole('link', { name: 'Manage HDF Submission' }).click();
  await expect(page).toHaveURL(/\/service-manager\/organisations\/.*\/hdfstatus/);
  await expect(page.getByRole('button', { name: 'Delete Submission' })).toBeVisible();

  // Click 'Delete Submission'
  await page.getByRole('button', { name: 'Delete Submission' }).click();

  // Handle confirmation dialog if present
  const confirmDelete = page.getByRole('button', { name: /confirm|yes|delete/i }).first();
  if (await confirmDelete.isVisible({ timeout: 2000 }).catch(() => false)) {
    await confirmDelete.click();
  }

  // Assert deletion succeeded — the page must not be a generic error page.
  const errorHeading = page.getByText(/an error occurred/i);
  if (await errorHeading.isVisible({ timeout: 5000 }).catch(() => false)) {
    throw new Error('HDF deletion failed: "An error occurred" page shown after clicking Delete Submission. The HDF submission may still be intact.');
  }

  // Confirm we are back on the HDF status page and the submission is gone.
  await expect(page).toHaveURL(/\/service-manager\/organisations\/.*\/hdfstatus/, { timeout: 10000 });
  await expect(page.getByRole('button', { name: 'Delete Submission' })).not.toBeVisible({ timeout: 5000 });

  await logoutFromAdmin(page);
}

test('teacher can submit HDF end-to-end with cleanup', async ({ page }, testInfo) => {
  const { env, adminBaseUrl } = getEnvironmentUrls(testInfo);

  test.skip(env === 'preprod', 'Preprod uses DfE Sign-in (OAuth) and this setup flow depends on username/password roles.');

  test.setTimeout(8 * 60 * 1000);

  try {
    // 1) Service-manager adjusts check window so the school is in the post-check admin period.
    await loginAsAdmin(page, adminBaseUrl, SERVICE_MANAGER_CREDENTIALS.username, SERVICE_MANAGER_CREDENTIALS.password);
    await configureCheckWindowForHdfSigningWithVerification(page, env);
    await logoutFromAdmin(page);

    // 2) Teacher submits HDF and lands on the submitted confirmation page.
    await loginAsAdmin(page, adminBaseUrl, TEACHER_CREDENTIALS.username, TEACHER_CREDENTIALS.password);
    await page.goto('/attendance/declaration-form');
    await dismissCookieBanner(page);
    await waitForHdfToBecomeAvailable(page);

    await page.getByLabel("Submitter's first name").fill('Test');
    await page.getByLabel("Submitter's last name").fill('Automation Full Submit');
    await page.getByRole('button', { name: 'Continue' }).click();

    await expect(page.getByRole('heading', { name: 'Review pupil details' })).toBeVisible();
    await page.getByRole('link', { name: 'Continue' }).click();

    await expect(page.getByRole('heading', { name: 'Confirm and submit' })).toBeVisible();
    await page.locator('#confirmAll').check();

    await Promise.all([
      page.waitForURL(/\/attendance\/submitted/),
      page.getByRole('button', { name: 'Submit' }).click(),
    ]);

    await expect(page.getByRole('heading', { name: /Headteacher.?s declaration form submitted/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /View the submitted form/i })).toBeVisible();

    // Verify state change: declaration endpoint now redirects to submitted page.
    await page.goto('/attendance/declaration-form');
    await expect(page).toHaveURL(/\/attendance\/submitted/);

    // 3) Service-manager deletes the submitted HDF to leave a clean slate for the next test run.
    await deleteSubmittedHdf(page, adminBaseUrl);
  } finally {
    // Always restore the check window to a known-good open state so subsequent tests
    // (generate live pins, accessibility check) are not left with a closed check window.
    // Restoring the original snapshot is avoided because the pre-test state may already
    // have had a closed live check period, which would propagate that problem forward.
    await loginAsAdmin(page, adminBaseUrl, SERVICE_MANAGER_CREDENTIALS.username, SERVICE_MANAGER_CREDENTIALS.password);
    await page.goto('/check-window/manage-check-windows');
    const manageHeading = page.getByRole('heading', { name: 'Manage check windows' });
    await expect(manageHeading).toBeVisible({ timeout: 10000 });

    await openCheckWindow(page, env);
    await restoreToOpenCheckWindow(page);

    await logoutFromAdmin(page).catch(() => undefined);
  }
});
