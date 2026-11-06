import { expect, type Page } from '@playwright/test';

export function requiredEnvironmentVariable(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Set ${name} before running the superuser browser tests.`);
  }
  return value;
}

async function signIn(page: Page, username: string, password: string): Promise<void> {
  await page.goto('/sign-in');
  const acceptCookies = page.getByRole('button', { name: 'Accept all cookies', exact: true });
  if (await acceptCookies.isVisible()) {
    await acceptCookies.click();
  }
  await page.getByRole('textbox', { name: 'Enter your user name.', exact: true }).fill(username);
  await page.getByLabel('Enter your password.', { exact: true }).fill(password);
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
}

export async function loginAsSuperuser(page: Page): Promise<void> {
  await signIn(page, requiredEnvironmentVariable('SUPERUSER_USERNAME'), requiredEnvironmentVariable('SUPERUSER_PASSWORD'));
  await expect(page).toHaveURL(/\/superuser$/);
  await expect(page.getByRole('heading', { name: 'MTC Superuser', exact: true })).toBeVisible();
}

export async function loginAsTeacher(page: Page): Promise<void> {
  await signIn(page, requiredEnvironmentVariable('TEACHER_USERNAME'), requiredEnvironmentVariable('TEACHER_PASSWORD'));
  await expect(page).toHaveURL(/\/school\/school-home$/);
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Manage the multiplication tables check for');
}
