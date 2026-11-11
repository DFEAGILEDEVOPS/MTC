import { randomUUID } from 'node:crypto';
import { test as base, expect, type Page } from '@playwright/test';
import { loginAsSuperuser, requiredEnvironmentVariable } from './superuser-test.helpers';

function messageRow(page: Page, title: string) {
  return page.locator('#submitted-service-message tbody tr')
    .filter({ has: page.getByText(title, { exact: true }) });
}

function messageBanner(page: Page, title: string) {
  return page.getByRole('region').filter({ has: page.getByRole('heading', { name: title, exact: true }) });
}

async function removeMessage(page: Page, title: string): Promise<void> {
  await messageRow(page, title).getByRole('button', { name: 'Remove', exact: true }).click();
  await expect(page).toHaveURL(/\/service-message$/);
  await expect(page.getByText('Service message has successfully been removed', { exact: true })).toBeVisible();
  await expect(messageRow(page, title)).toHaveCount(0);
}

const test = base.extend<{ messageTitles: string[] }>({
  messageTitles: [async ({ browser, baseURL }, use) => {
    const titles: string[] = [];
    try {
      await use(titles);
    } finally {
      if (titles.length > 0) {
        const context = await browser.newContext({ baseURL, storageState: { cookies: [], origins: [] } });
        try {
          const page = await context.newPage();
          await loginAsSuperuser(page);
          await page.goto('/service-message');
          await expect(page.getByRole('heading', { name: 'Service message', exact: true })).toBeVisible();
          for (const title of titles) {
            if (await messageRow(page, title).count() > 0) {
              await removeMessage(page, title);
            }
            await expect(messageRow(page, title)).toHaveCount(0);
          }
          await page.goto('/superuser');
          for (const title of titles) {
            await expect(messageBanner(page, title)).toHaveCount(0);
          }
        } finally {
          await context.close();
        }
      }
    }
  }, { timeout: 60_000 }],
});

async function openCreateForm(page: Page): Promise<void> {
  await page.getByRole('link', { name: 'Service message', exact: true }).click();
  await expect(page).toHaveURL(/\/service-message$/);
  await expect(page.getByRole('heading', { name: 'Service message', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Create service message', exact: true }).click();
  await expect(page).toHaveURL(/\/service-message\/service-message-form$/);
  await expect(page.getByRole('heading', { name: 'Create service message', exact: true })).toBeVisible();
  await expect(page.locator('.CodeMirror')).toBeVisible();
}

async function fillMessage(page: Page, content: string): Promise<void> {
  // SimpleMDE hides the underlying textarea; exercise its visible editor instead.
  await page.locator('.CodeMirror').click();
  await page.keyboard.press('ControlOrMeta+A');
  await page.keyboard.insertText(content);
}

async function saveMessage(page: Page): Promise<void> {
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await expect(page).toHaveURL(/\/service-message$/);
  await expect(page.getByText('Service message has successfully been created', { exact: true })).toBeVisible();
}

test.describe('Superuser service messages', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test.beforeEach(async ({ page }) => {
    await loginAsSuperuser(page);
  });

  test('creates, edits and removes an all-areas message on the superuser homepage', async ({ page, messageTitles }) => {
    const title = `Playwright superuser ${randomUUID()}`;
    const editedTitle = `${title} edited`;
    messageTitles.push(title, editedTitle);
    await openCreateForm(page);
    await page.locator('#serviceMessageTitle').fill(title);
    await fillMessage(page, '**Initial service announcement**');
    await page.getByLabel('Message border colour', { exact: true }).selectOption('O');
    await expect(page.locator('input[name="areaCode"]:checked')).toHaveCount(0);
    await saveMessage(page);
    await expect(messageRow(page, title)).toHaveCount(1);
    await expect(messageRow(page, title).getByRole('link', { name: 'Edit', exact: true })).toBeVisible();
    await expect(messageRow(page, title).getByRole('button', { name: 'Remove', exact: true })).toBeVisible();
    await page.goto('/superuser');
    const initialBanner = messageBanner(page, title);
    await expect(initialBanner).toBeVisible();
    await expect(initialBanner).toHaveClass('mtc-notification-banner-orange');
    await expect(initialBanner.locator('strong')).toHaveText('Initial service announcement');
    await page.reload();
    await expect(initialBanner).toBeVisible();

    await page.getByRole('link', { name: 'Service message', exact: true }).click();
    await messageRow(page, title).getByRole('link', { name: 'Edit', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Edit service message', exact: true })).toBeVisible();
    await expect(page.locator('#serviceMessageTitle')).toHaveValue(title);
    await expect(page.locator('.CodeMirror')).toContainText('**Initial service announcement**');
    await page.locator('#serviceMessageTitle').fill(editedTitle);
    await fillMessage(page, '**Updated service announcement**');
    await page.getByLabel('Message border colour', { exact: true }).selectOption('G');
    await saveMessage(page);
    await expect(messageRow(page, title)).toHaveCount(0);
    await expect(messageRow(page, editedTitle)).toHaveCount(1);
    await page.goto('/superuser');
    await page.reload();
    await expect(messageBanner(page, title)).toHaveCount(0);
    const editedBanner = messageBanner(page, editedTitle);
    await expect(editedBanner).toBeVisible();
    await expect(editedBanner).toHaveClass('mtc-notification-banner-green');
    await expect(editedBanner.locator('strong')).toHaveText('Updated service announcement');

    await page.getByRole('link', { name: 'Service message', exact: true }).click();
    await removeMessage(page, editedTitle);
    await page.reload();
    await expect(messageRow(page, editedTitle)).toHaveCount(0);
    await page.goto('/superuser');
    await expect(messageBanner(page, editedTitle)).toHaveCount(0);
  });

  for (const missingField of ['title', 'content']) {
    test(`rejects a missing ${missingField} without creating a message`, async ({ page, messageTitles }) => {
      const title = `Playwright validation ${randomUUID()}`;
      const content = 'Validation test content';
      messageTitles.push(title);
      await openCreateForm(page);
      if (missingField !== 'title') {
        await page.locator('#serviceMessageTitle').fill(title);
      }
      if (missingField !== 'content') {
        await fillMessage(page, content);
      }
      await page.getByRole('button', { name: 'Save', exact: true }).click();
      await expect(page).toHaveURL(/\/service-message\/submit-service-message$/);
      await expect(page.getByRole('heading', { name: 'Create service message', exact: true })).toBeVisible();
      await expect(page.locator('[data-module="govuk-error-summary"]'))
        .toContainText(`Service message ${missingField} is required`);
      await expect(page.locator('#serviceMessageTitle')).toHaveValue(missingField === 'title' ? '' : title);
      await expect(page.locator('.CodeMirror')).toBeVisible();
      if (missingField === 'title') {
        await expect(page.locator('.CodeMirror')).toContainText(content);
      }
      await page.getByRole('link', { name: 'Cancel', exact: true }).click();
      await expect(page).toHaveURL(/\/service-message$/);
      await expect(messageRow(page, title)).toHaveCount(0);
    });
  }

  test('cancels a populated create form without saving', async ({ page, messageTitles }) => {
    const title = `Playwright cancelled ${randomUUID()}`;
    messageTitles.push(title);
    await openCreateForm(page);
    await page.locator('#serviceMessageTitle').fill(title);
    await fillMessage(page, 'This message must not be saved.');
    await page.getByRole('link', { name: 'Cancel', exact: true }).click();
    await expect(page).toHaveURL(/\/service-message$/);
    await expect(messageRow(page, title)).toHaveCount(0);
    await page.goto('/superuser');
    await expect(messageBanner(page, title)).toHaveCount(0);
  });

  test('shows a school-home-targeted message only on the school homepage', async ({ page, messageTitles }) => {
    const title = `Playwright school-only ${randomUUID()}`;
    messageTitles.push(title);
    await openCreateForm(page);
    await page.locator('#serviceMessageTitle').fill(title);
    await fillMessage(page, '**School homepage only**');
    await page.getByText('Target the message to one or more specific areas of the site:', { exact: true }).click();
    await page.locator('#area-L').check();
    await expect(page.locator('input[name="areaCode"]:checked')).toHaveCount(1);
    await saveMessage(page);
    await expect(messageRow(page, title)).toHaveCount(1);
    await page.goto('/superuser');
    await expect(messageBanner(page, title)).toHaveCount(0);
    await page.getByRole('link', { name: 'Impersonate a school', exact: true }).click();
    await page.locator('#dfeNumber').fill(requiredEnvironmentVariable('SUPERUSER_SCHOOL_DFE_NUMBER'));
    await page.getByRole('button', { name: 'Submit', exact: true }).click();
    await expect(page).toHaveURL(/\/school\/school-home$/);
    await expect(messageBanner(page, title)).toBeVisible();
    await expect(messageBanner(page, title).locator('strong')).toHaveText('School homepage only');
    await page.getByRole('button', { name: 'Remove impersonation', exact: true }).click();
    await expect(page).toHaveURL(/\/helpdesk\/school-impersonation$/);
  });
});
