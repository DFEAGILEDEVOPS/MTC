import { test as base, expect, type Page } from '@playwright/test';
import { loginAsSuperuser, requiredEnvironmentVariable } from './superuser-test.helpers';

interface School {
  name: string;
  dfeNumber: string;
  urn: string;
}

interface MoveFixture {
  summaryUrl: string;
  pupilName: string;
  original: School;
  destination: School;
}

function summaryValue(page: Page, label: string) {
  return page.locator('.govuk-summary-list__row')
    .filter({ has: page.locator('dt').filter({ hasText: new RegExp(`^\\s*${label}\\s*$`) }) })
    .locator('dd');
}

async function expectSchool(page: Page, school: School): Promise<void> {
  await expect(summaryValue(page, 'UPN')).toHaveText(requiredEnvironmentVariable('SUPERUSER_PUPIL_UPN'));
  await expect(summaryValue(page, 'DFE Number')).toHaveText(school.dfeNumber);
  await expect(summaryValue(page, 'School')).toHaveText(school.name);
  await expect(summaryValue(page, 'URN')).toHaveText(school.urn);
}

async function openMove(page: Page): Promise<void> {
  await page.getByRole('link', { name: 'Move pupil to different school', exact: true }).click();
  await expect(page).toHaveURL(/\/service-manager\/pupil\/move\/[^/]+$/);
  await expect(page.getByRole('heading', { name: 'Move to a new school', exact: true })).toBeVisible();
}

async function confirmDestination(page: Page, school: School): Promise<void> {
  await page.locator('#targetSchoolURN').fill(school.urn);
  await page.getByRole('button', { name: 'Go to confirmation page', exact: true }).click();
  await expect(page).toHaveURL(/\/service-manager\/pupil\/move\/[^/]+\/confirm\/[^/]+$/);
  await expect(page.getByRole('heading', { name: 'Confirm pupil move', exact: true })).toBeVisible();
  await expect(page.locator('main p').filter({ hasText: 'To school:' }))
    .toContainText(`To school: ${school.name} URN: ${school.urn} DFE number: ${school.dfeNumber}`);
}

async function submitMove(page: Page, school: School, summaryUrl: string): Promise<void> {
  await page.getByRole('button', { name: `Move the pupil to ${school.name}`, exact: true }).click();
  await expect(page).toHaveURL(summaryUrl, { ignoreCase: true });
  await expect(page.getByText(`Pupil moved to ${school.name} (${school.urn})`, { exact: true })).toBeVisible();
  await expectSchool(page, school);
}

const test = base.extend<{ moveFixture: MoveFixture }>({
  moveFixture: async ({ page }, use) => {
    await loginAsSuperuser(page);
    const destinationDfe = requiredEnvironmentVariable('SUPERUSER_MOVE_DESTINATION_DFE_NUMBER');
    await page.getByRole('link', { name: 'Search organisations', exact: true }).click();
    await page.getByRole('textbox', { name: 'Search', exact: true }).fill(destinationDfe);
    await page.getByRole('button', { name: 'Search', exact: true }).click();
    await expect(summaryValue(page, 'DFE Number')).toHaveText(destinationDfe);
    const destination: School = {
      name: (await page.getByRole('heading', { level: 1 }).innerText()).trim(),
      dfeNumber: destinationDfe,
      urn: (await summaryValue(page, 'URN').innerText()).trim(),
    };
    await page.goto('/superuser');
    await page.getByRole('link', { name: 'Pupil search', exact: true }).click();
    await page.getByRole('textbox', { name: 'Search by UPN', exact: true })
      .fill(requiredEnvironmentVariable('SUPERUSER_PUPIL_UPN'));
    await page.getByRole('button', { name: 'Search', exact: true }).click();
    await expect(page, 'The dedicated UPN must resolve to one pupil').toHaveURL(/\/service-manager\/pupil-summary\/[^/]+$/);
    await expect(summaryValue(page, 'UPN')).toHaveText(requiredEnvironmentVariable('SUPERUSER_PUPIL_UPN'));
    const original: School = {
      name: (await summaryValue(page, 'School').innerText()).trim(),
      dfeNumber: (await summaryValue(page, 'DFE Number').innerText()).trim(),
      urn: (await summaryValue(page, 'URN').innerText()).trim(),
    };
    expect(destination.dfeNumber, 'Destination must differ from the original school').not.toBe(original.dfeNumber);
    await use({
      summaryUrl: page.url(),
      pupilName: (await page.getByRole('heading', { level: 1 }).innerText()).trim(),
      original,
      destination,
    });
  },
});

test.describe('Superuser move pupil', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test('shows the pupil and cancels the move form without changing school', async ({ page, moveFixture }) => {
    await openMove(page);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(moveFixture.pupilName);
    await expectSchool(page, moveFixture.original);
    await page.getByRole('link', { name: 'Cancel', exact: true }).click();
    await expect(page).toHaveURL(moveFixture.summaryUrl, { ignoreCase: true });
    await page.reload();
    await expectSchool(page, moveFixture.original);
  });

  for (const { input, error } of [
    { input: '', error: 'No target school provided' },
    { input: '0', error: 'Error retrieving school:' },
    { input: 'original', error: 'Target school is the existing school!' },
  ]) {
    test(`rejects destination "${input}" without moving the pupil`, async ({ page, moveFixture }) => {
      await openMove(page);
      await page.locator('#targetSchoolURN').fill(input === 'original' ? moveFixture.original.urn : input);
      await page.getByRole('button', { name: 'Go to confirmation page', exact: true }).click();
      await expect(page).toHaveURL(/\/service-manager\/pupil\/move\/[^/]+$/);
      await expect(page.locator('#targetSchoolURN').locator('..').locator('.govuk-error-message')).toContainText(error);
      await page.getByRole('link', { name: 'Cancel', exact: true }).click();
      await page.reload();
      await expectSchool(page, moveFixture.original);
    });
  }

  test('shows the correct confirmation and cancels without moving the pupil', async ({ page, moveFixture }) => {
    await openMove(page);
    await confirmDestination(page, moveFixture.destination);
    await expect(page.getByRole('heading', { level: 2, name: moveFixture.pupilName, exact: true })).toBeVisible();
    await expect(page.locator('main p').filter({ hasText: 'From school:' }))
      .toContainText(`From school: ${moveFixture.original.name} (DfE# ${moveFixture.original.dfeNumber})`);
    await page.getByRole('link', { name: 'Cancel', exact: true }).click();
    await expect(page).toHaveURL(moveFixture.summaryUrl, { ignoreCase: true });
    await page.reload();
    await expectSchool(page, moveFixture.original);
  });

  test('navigates move-form breadcrumbs back to the superuser homepage', async ({ page, moveFixture }) => {
    await openMove(page);
    const breadcrumbs = page.locator('.govuk-breadcrumbs');
    await breadcrumbs.getByRole('link', { name: 'Pupil summary', exact: true }).click();
    await expect(page).toHaveURL(moveFixture.summaryUrl, { ignoreCase: true });
    await openMove(page);
    await breadcrumbs.getByRole('link', { name: 'Pupil search', exact: true }).click();
    await expect(page).toHaveURL(/\/service-manager\/pupil-search$/);
    await breadcrumbs.getByRole('link', { name: 'Home', exact: true }).click();
    await expect(page).toHaveURL(/\/superuser$/);
  });
});

test.describe('Superuser confirmed pupil move', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  const movingTest = test.extend<{ restoreSchool: void }>({
    restoreSchool: [async ({ browser, baseURL, moveFixture }, use) => {
      try {
        await use();
      } finally {
        const context = await browser.newContext({ baseURL, storageState: { cookies: [], origins: [] } });
        try {
          const page = await context.newPage();
          await loginAsSuperuser(page);
          await page.goto(moveFixture.summaryUrl);
          await expect(summaryValue(page, 'UPN')).toHaveText(requiredEnvironmentVariable('SUPERUSER_PUPIL_UPN'));
          const currentDfe = (await summaryValue(page, 'DFE Number').innerText()).trim();
          if (currentDfe !== moveFixture.original.dfeNumber) {
            expect(currentDfe, 'Refusing to overwrite an unexpected concurrent school move').toBe(moveFixture.destination.dfeNumber);
            await openMove(page);
            await confirmDestination(page, moveFixture.original);
            await submitMove(page, moveFixture.original, moveFixture.summaryUrl);
          }
          await page.reload();
          await expectSchool(page, moveFixture.original);
        } finally {
          await context.close();
        }
      }
    }, { auto: true, timeout: 60_000 }],
  });

  movingTest('moves to the destination, persists after reload and restores the original school', async ({ page, moveFixture }) => {
    await openMove(page);
    await confirmDestination(page, moveFixture.destination);
    await submitMove(page, moveFixture.destination, moveFixture.summaryUrl);
    await page.reload();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(moveFixture.pupilName);
    await expectSchool(page, moveFixture.destination);
  });
});
