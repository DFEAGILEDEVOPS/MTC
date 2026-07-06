import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const pupilBaseUrl = process.env.PUPIL_BASE_URL ?? 'https://testpupil-as-mtc.azurewebsites.net';
const adminBaseUrl = process.env.ADMIN_BASE_URL ?? 'https://testadmin-as-mtc.azurewebsites.net';

function violationSummary(violations: { id: string; impact?: string | null; description: string }[]): string {
  if (!violations.length) {
    return 'No WCAG violations detected.';
  }

  return violations
    .map((violation) => `${violation.id} (${violation.impact ?? 'unknown impact'}): ${violation.description}`)
    .join('\n');
}

test.describe('Accessibility pages', () => {
  test('pupil accessibility statement is available and exposed in accessibility tree', async ({ page }) => {
    await page.goto(`${pupilBaseUrl}/accessibility-statement`, { waitUntil: 'domcontentloaded' });

    await expect(page.getByRole('heading', { level: 1, name: /Accessibility statement/i })).toBeVisible();
    await expect(page.getByRole('main')).toBeVisible();

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
      .analyze();

    if (results.violations.length > 0) {
      console.log('🔍 Pupil Accessibility Statement - WCAG Violations (Report Only):\n', violationSummary(results.violations));
    } else {
      console.log('✓ Pupil Accessibility Statement - No WCAG violations detected.');
    }
  });

  test('admin accessibility statement is available and exposed in accessibility tree', async ({ page }) => {
    await page.goto(`${adminBaseUrl}/accessibility-statement`, { waitUntil: 'domcontentloaded' });

    await expect(page.getByRole('heading', { level: 1, name: /Accessibility statement/i })).toBeVisible();
    await expect(page.getByRole('main')).toBeVisible();

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
      .analyze();

    if (results.violations.length > 0) {
      console.log('🔍 Admin Accessibility Statement - WCAG Violations (Report Only):\n', violationSummary(results.violations));
    } else {
      console.log('✓ Admin Accessibility Statement - No WCAG violations detected.');
    }
  });
});