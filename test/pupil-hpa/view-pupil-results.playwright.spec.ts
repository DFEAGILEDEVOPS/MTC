import { test, expect, type Page, type TestInfo } from '@playwright/test';
import { environmentUrls } from './playwright.config';

type EnvironmentName = keyof typeof environmentUrls;

function getEnvironmentUrls(testInfo: TestInfo): { env: EnvironmentName; adminBaseUrl: string; pupilBaseUrl: string } {
  const env = testInfo.project.name.split('-')[0] as EnvironmentName;
  const urls = environmentUrls[env];

  if (!urls) {
    throw new Error(`Unsupported Playwright project name '${testInfo.project.name}'. Expected one of: dev-*, test-*, preprod-*.`);
  }

  return { env, ...urls };
}

/**
 * Helper function to get the fixed check window date in DD/MM/YYYY format
 */
function getFixedCheckWindowDate(): { day: string; month: string; year: string } {
  return { day: '04', month: '04', year: '2026' };
}

/**
 * Helper function to dismiss the GOV.UK cookie consent banner if present
 */
async function dismissCookieBanner(page: Page): Promise<void> {
  const acceptCookiesButton = page.getByRole('button', { name: 'Accept all cookies' });
  if (await acceptCookiesButton.isVisible({ timeout: 3000 }).catch(() => false)) {
    await acceptCookiesButton.click();
  }
}

/**
 * Helper function to log in to the admin site
 */
async function loginAsAdmin(page: Page, username: string, password: string): Promise<void> {
  await dismissCookieBanner(page);
  const userNameField = page.getByRole('textbox', { name: 'Enter your user name.' });
  if (await userNameField.isVisible({ timeout: 2000 }).catch(() => false)) {
    await userNameField.fill(username);
    await page.getByRole('textbox', { name: 'Enter your password.' }).fill(password);
    await page.getByRole('button', { name: 'Sign in' }).click();
  }
  await expect(page).toHaveURL(/admin|multiplication-tables-check\.service\.gov\.uk/);
  await dismissCookieBanner(page);
}

/**
 * Helper function to log out from admin site
 */
async function logoutFromAdmin(page: Page): Promise<void> {
  const signOutButton = page.getByRole('button', { name: 'Sign out' });
  if (await signOutButton.count()) {
    await signOutButton.first().click();
  } else {
    await page.getByRole('link', { name: 'Sign out' }).click();
  }
}

/**
 * Open the desired check window with strict environment-specific naming.
 */
async function openCheckWindow(page: Page, env: EnvironmentName): Promise<void> {
  const checkWindowName = env === 'dev' ? 'testing 2026' : 'Development Phase';
  const checkWindowLink = page.getByRole('link', { name: checkWindowName, exact: true });
  await expect(checkWindowLink).toBeVisible();
  await checkWindowLink.click();
}

/**
 * Fill all Day/Month/Year input sets and verify values were entered.
 */
async function fillAndVerifyDateInputs(
  page: Page,
  date: { day: string; month: string; year: string },
  clearBeforeFill = false
): Promise<void> {
  const dayInputs = page.locator('input:not([type="hidden"]):visible[name*="day" i], input:not([type="hidden"]):visible[id*="day" i], input:not([type="hidden"]):visible[placeholder*="day" i], input:not([type="hidden"]):visible[aria-label*="day" i]');
  const monthInputs = page.locator('input:not([type="hidden"]):visible[name*="month" i], input:not([type="hidden"]):visible[id*="month" i], input:not([type="hidden"]):visible[placeholder*="month" i], input:not([type="hidden"]):visible[aria-label*="month" i]');
  const yearInputs = page.locator('input:not([type="hidden"]):visible[name*="year" i], input:not([type="hidden"]):visible[id*="year" i], input:not([type="hidden"]):visible[placeholder*="year" i], input:not([type="hidden"]):visible[aria-label*="year" i]');

  const dayCount = await dayInputs.count();
  const monthCount = await monthInputs.count();
  const yearCount = await yearInputs.count();

  expect(dayCount, 'Expected at least one day input').toBeGreaterThan(0);
  expect(monthCount, 'Expected at least one month input').toBeGreaterThan(0);
  expect(yearCount, 'Expected at least one year input').toBeGreaterThan(0);
  expect(monthCount, 'Day/month input count mismatch').toBe(dayCount);
  expect(yearCount, 'Day/year input count mismatch').toBe(dayCount);

  const normalizedDay = String(Number(date.day));
  const normalizedMonth = String(Number(date.month));

  for (let i = 0; i < dayCount; i += 1) {
    const dayInput = dayInputs.nth(i);
    const monthInput = monthInputs.nth(i);
    const yearInput = yearInputs.nth(i);

    if (clearBeforeFill) {
      await dayInput.clear();
      await monthInput.clear();
      await yearInput.clear();
    }

    await dayInput.fill(date.day);
    await monthInput.fill(date.month);
    await yearInput.fill(date.year);

    await expect(dayInput).toHaveValue(new RegExp(`^0?${normalizedDay}$`));
    await expect(monthInput).toHaveValue(new RegExp(`^0?${normalizedMonth}$`));
    await expect(yearInput).toHaveValue(date.year);
  }
}

/**
 * Test: Manage check windows and verify pupil results visibility
 * This test verifies that when a service manager sets the check window to 04/04/2026,
 * teachers can view pupil results. Then the service manager resets the check window to the future.
 */
test('Service Manager sets check window to 04/04/2026, Teacher views pupil results, then Service Manager resets to future date', async ({ page }, testInfo) => {
  const { env, adminBaseUrl } = getEnvironmentUrls(testInfo);

  // This test uses username/password login and admin-only navigation.
  test.skip(env === 'preprod', 'Preprod uses DfE Sign-in (OAuth) — username/password auth is not available.');

  const fixedCheckWindowDate = getFixedCheckWindowDate();

  // ========== STEP 1-10: Service Manager sets check window to 04/04/2026 ==========

  // 1) Navigate to Admin site
  await page.goto(`${adminBaseUrl}/sign-in`);

  // 2) Log in as service-manager
  await loginAsAdmin(page, 'service-manager', 'password');

  // 3) Click on: Manage check windows
  await page.getByRole('link', { name: 'Manage check windows' }).click();
  await dismissCookieBanner(page);

  // 4) Click on the check window
  await openCheckWindow(page, env);
  await dismissCookieBanner(page);

  // 5-6) There are 3 sets of 3 input boxes (Day/Month/Year) - Enter 04/04/2026 into all 3 sets
  await fillAndVerifyDateInputs(page, fixedCheckWindowDate);

  // 7) Click Save
  await page.getByRole('button', { name: 'Save' }).click();

  // 8) Tick "Override the warnings on this screen." checkbox
  const overrideWarnings = page
    .getByRole('checkbox', { name: /Override the warnings on this screen\.?/i })
    .or(page.locator('input[type="checkbox"][name*="override" i]'))
    .or(page.locator('input[type="checkbox"][id*="override" i]'))
    .first();
  await expect(overrideWarnings).toBeVisible();
  await overrideWarnings.check();
  await expect(overrideWarnings).toBeChecked();

  // 9) Click Save again
  await page.getByRole('button', { name: 'Save' }).click();

  // 10) Click Sign out
  await logoutFromAdmin(page);

  // ========== STEP 11-14: Teacher logs in and views pupil results ==========

  // 11) Navigate to admin site
  await page.goto(`${adminBaseUrl}/sign-in`);

  // 12) Sign in as teacher1
  await loginAsAdmin(page, 'teacher1', 'password');

  // 13) Click View pupil results
  await page.getByRole('link', { name: /View pupil results/i }).click();
  await dismissCookieBanner(page);

  // 14) Verify that pupil results page is loaded
  await expect(page).toHaveURL(/\/results\/view-results/i);

  // 15) Sign out
  await logoutFromAdmin(page);

  // ========== STEP 16-23: Service Manager resets check window to future date ==========

  // 16) Navigate to admin site
  await page.goto(`${adminBaseUrl}/sign-in`);

  // 17) Log in as service-manager
  await loginAsAdmin(page, 'service-manager', 'password');

  // 18) Click on: Manage check windows
  await page.getByRole('link', { name: 'Manage check windows' }).click();
  await dismissCookieBanner(page);

  // 19) Click on the check window
  await openCheckWindow(page, env);
  await dismissCookieBanner(page);

  // 20-21) Enter the date 02/10/2027 (Day/Month/Year) into all 3 sets of input boxes
  await fillAndVerifyDateInputs(page, { day: '02', month: '10', year: '2027' }, true);

  // 22) Click Save
  await page.getByRole('button', { name: 'Save' }).click();

  // 23) Click Sign out
  await logoutFromAdmin(page);
});

