import { test, expect, type Locator, type Page, type TestInfo } from '@playwright/test';
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

async function continueAdminSessionIfPrompted(page: Page): Promise<void> {
	const sessionPromptYes = page.getByRole('button', { name: 'Yes', exact: true });
	if (await sessionPromptYes.isVisible({ timeout: 1500 }).catch(() => false)) {
		await sessionPromptYes.click();
	}
}

async function proceedAfterPupilSelection(page: Page, targetPupilName: string): Promise<void> {
	const confirmButton = page.getByRole('button', { name: 'Confirm' }).or(page.locator('button:has-text("Confirm")')).first();
	const preConfirmUrl = page.url();
	const selectedCount = await page.locator('input[type="checkbox"]:checked, [role="checkbox"][aria-checked="true"]').count().catch(() => 0);
	const escapedTarget = targetPupilName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
	const [targetLastNameRaw, targetFirstNameRaw] = targetPupilName.split(',').map((part) => part.trim());
	const targetFirstName = targetFirstNameRaw ?? '';
	const targetLastName = targetLastNameRaw ?? '';
	const escapedTargetFirst = targetFirstName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
	const escapedTargetLast = targetLastName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
	const targetTickRegex = new RegExp(
		targetFirstName && targetLastName
			? `Tick pupil\\s+(${escapedTargetLast}\\s*,\\s*${escapedTargetFirst}|${escapedTargetFirst}\\s+${escapedTargetLast}|${escapedTarget})\\.?`
			: `Tick pupil\\s+${escapedTarget}\\.?`,
		'i',
	);
	const targetCheckbox = page.getByRole('checkbox', { name: targetTickRegex }).first();
	const targetChecked = (await targetCheckbox.isChecked().catch(() => false))
		|| (await targetCheckbox.getAttribute('aria-checked').catch(() => null)) === 'true';

	if (selectedCount === 0) {
		throw new Error('No pupil checkbox is selected, so Confirm cannot proceed.');
	}
	if (!targetChecked) {
		throw new Error(`Target pupil '${targetPupilName}' is not selected, so Confirm cannot proceed.`);
	}

	if (await confirmButton.isVisible({ timeout: 2500 }).catch(() => false)) {
		await confirmButton.scrollIntoViewIfNeeded({ timeout: 5000 }).catch(() => undefined);
		await confirmButton.click({ timeout: 5000 });
		await page.waitForTimeout(1000);
		if (page.url() !== preConfirmUrl) {
			return;
		}
	}

	const clickedStickyConfirm = await page.evaluate(() => {
		const stickyConfirm = document.querySelector<HTMLButtonElement>('#stickyConfirm');
		if (!stickyConfirm || stickyConfirm.disabled) {
			return false;
		}
		stickyConfirm.click();
		return true;
	});
	if (clickedStickyConfirm) {
		await page.waitForTimeout(1000);
		if (page.url() !== preConfirmUrl) {
			return;
		}
	}

	const submittedForm = await page.evaluate(() => {
		const form = document.querySelector<HTMLFormElement>('form[name="stickyBannerForm"]');
		if (!form) {
			return false;
		}
		if (typeof form.requestSubmit === 'function') {
			form.requestSubmit();
		} else {
			form.submit();
		}
		return true;
	});
	if (submittedForm) {
		return;
	}

	if (!clickedStickyConfirm) {
		throw new Error(`Could not find actionable Confirm button for selected pupil(s). Current URL: ${page.url()}`);
	}
}

async function ensurePinsAreVisible(page: Page, targetPupilName: string): Promise<void> {
	await continueAdminSessionIfPrompted(page);

	const pupilRows = page.getByRole('row', { name: /School Password:/i });
	if ((await pupilRows.count()) === 0) {
		throw new Error('No School Password/PIN rows are visible after confirming pupil selection.');
	}

	const escaped = targetPupilName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
	const targetRow = page.getByRole('row').filter({ hasText: new RegExp(escaped, 'i') }).first();
	if (await targetRow.isVisible({ timeout: 5000 }).catch(() => false)) {
		return;
	}

	const availableRows = await page
		.getByRole('row', { name: /School Password:/i })
		.allInnerTexts()
		.catch(() => [] as string[]);
	const debugRows = availableRows
		.map((text, index) => `[row ${index + 1}] ${text.replace(/\s+/g, ' ').trim().slice(0, 220)}`)
		.join(' | ');

	throw new Error(`Generated PIN rows do not include target pupil '${targetPupilName}'. Visible rows: ${debugRows || 'none'}`);
}

async function selectPupilByName(page: Page, pupilName: string): Promise<void> {
	const escaped = pupilName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
	const [lastNameRaw, firstNameRaw] = pupilName.split(',').map((part) => part.trim());
	const firstName = firstNameRaw ?? '';
	const lastName = lastNameRaw ?? '';
	const escapedFirst = firstName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
	const escapedLast = lastName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
	const fullNameFirstLast = firstName && lastName ? `${firstName} ${lastName}` : '';
	const escapedFullNameFirstLast = fullNameFirstLast.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
	const nameRegex = new RegExp(
		firstName && lastName
			? `${escapedLast}\\s*,\\s*${escapedFirst}|${escapedFirst}\\s+${escapedLast}`
			: escaped,
		'i',
	);
	const tickLabelRegex = new RegExp(
		firstName && lastName
			? `Tick pupil\\s+(${escapedLast}\\s*,\\s*${escapedFirst}|${escapedFirst}\\s+${escapedLast}|${escapedFullNameFirstLast})\\.?`
			: `Tick pupil\\s+${escaped}\\.?`,
		'i',
	);

	const checkedCount = async (): Promise<number> => page.locator('input[type="checkbox"]:checked, [role="checkbox"][aria-checked="true"]').count().catch(() => 0);
	const isLocatorChecked = async (locator: Locator): Promise<boolean> => {
		const nativeChecked = await locator.isChecked().catch(() => false);
		if (nativeChecked) {
			return true;
		}
		const ariaChecked = await locator.getAttribute('aria-checked').catch(() => null);
		return ariaChecked === 'true';
	};

	const checkboxByAriaLabel = firstName && lastName
		? page.locator(`input[name="pupil"][type="checkbox"][aria-label*="${firstName}"][aria-label*="${lastName}"]`).first()
		: page.locator(`input[name="pupil"][type="checkbox"][aria-label*="${pupilName}"]`).first();

	if (await checkboxByAriaLabel.isVisible({ timeout: 7000 }).catch(() => false)) {
		await checkboxByAriaLabel.check().catch(async () => checkboxByAriaLabel.click({ force: true }));
		if (await isLocatorChecked(checkboxByAriaLabel)) {
			return;
		}
	}

	const checkboxByTickLabel = page.getByRole('checkbox', { name: tickLabelRegex }).first();

	if (await checkboxByTickLabel.isVisible({ timeout: 7000 }).catch(() => false)) {
		await checkboxByTickLabel.check().catch(async () => checkboxByTickLabel.click({ force: true }));
		if (await isLocatorChecked(checkboxByTickLabel)) {
			return;
		}
	}

	const nameLabel = page.locator('label').filter({ hasText: nameRegex }).first();
	if (await nameLabel.isVisible({ timeout: 7000 }).catch(() => false)) {
		const inputId = (await nameLabel.getAttribute('for'))?.trim();
		if (inputId) {
			const checkboxById = page.locator(`#${inputId}`);
			if (await checkboxById.isVisible({ timeout: 3000 }).catch(() => false)) {
				await checkboxById.check().catch(async () => checkboxById.click({ force: true }));
				if (await isLocatorChecked(checkboxById)) {
					return;
				}
			}
		}
	}

	const rowByName = page.getByRole('row').filter({
		hasText: nameRegex,
	}).first();

	if (await rowByName.isVisible({ timeout: 7000 }).catch(() => false)) {
		const roleCheckboxInRow = rowByName.getByRole('checkbox').first();
		if (await roleCheckboxInRow.isVisible({ timeout: 3000 }).catch(() => false)) {
			await roleCheckboxInRow.check().catch(async () => roleCheckboxInRow.click({ force: true }));
			if (await isLocatorChecked(roleCheckboxInRow)) {
				return;
			}
		}

		const checkboxInRow = rowByName.locator('input[name="pupil"][type="checkbox"]').first();
		if (await checkboxInRow.isVisible({ timeout: 1500 }).catch(() => false)) {
			await checkboxInRow.check().catch(async () => checkboxInRow.click({ force: true }));
			if (await isLocatorChecked(checkboxInRow)) {
				return;
			}
		}

		const clickedByDom = await rowByName.evaluate((row) => {
			const checkbox = row.querySelector<HTMLInputElement>('input[name="pupil"][type="checkbox"]');
			if (!checkbox) {
				return false;
			}
			checkbox.click();
			return checkbox.checked;
		});
		if (clickedByDom) {
			return;
		}
	}

	const availableRows = await page
		.getByRole('row', { name: /Tick pupil/i })
		.allInnerTexts()
		.catch(() => [] as string[]);
	const debugRows = availableRows
		.map((text, index) => `[row ${index + 1}] ${text.replace(/\s+/g, ' ').trim().slice(0, 180)}`)
		.join(' | ');
	const matchingAriaLabels = await page
		.locator('input[name="pupil"][type="checkbox"][aria-label]')
		.evaluateAll((nodes, pattern) => {
			const regex = new RegExp(pattern, 'i');
			return nodes
				.map((node) => {
					const input = node as HTMLInputElement;
					return {
						label: input.getAttribute('aria-label') ?? '',
						checked: input.checked,
					};
				})
				.filter((item) => regex.test(item.label))
				.slice(0, 8);
		}, `${firstName}.*${lastName}`)
		.catch(() => [] as { label: string; checked: boolean }[]);
	const finalCheckedCount = await checkedCount();

	throw new Error(`Failed to select checkbox for target pupil '${pupilName}'. Checked count after selection attempts: ${finalCheckedCount}. Available selectable rows: ${debugRows || 'none found'}. Matching aria-label candidates: ${JSON.stringify(matchingAriaLabels)}`);
}

async function validateColourContrastRoutingAfterSignIn(page: Page): Promise<void> {
	await page.waitForURL(/\/colour-choice|\/sign-in-success|\/access-settings/, { timeout: 15000 });

	if (page.url().includes('/colour-choice')) {
		await expect(page.getByText('Choose colour of page', { exact: true })).toBeVisible();
		return;
	}

	if (page.url().includes('/sign-in-success')) {
		await page.getByRole('button', { name: 'Next', exact: true }).click();
		await page.waitForURL(/\/access-settings/, { timeout: 10000 });
	}

	if (page.url().includes('/access-settings')) {
		await expect(page.getByRole('heading', { name: 'Your settings', level: 1 })).toBeVisible();
		await expect(page.getByText(/\bEdit colour\b\s+of page/i)).toBeVisible();
		return;
	}

	throw new Error(`Unexpected post-sign-in routing path for colour settings validation. Current URL: ${page.url()}`);
}

test('admin generates creds and validates colour contrast routing after pupil sign in', async ({ page }, testInfo) => {
	test.skip(!testInfo.project.name.endsWith('-admin'), `Runs once per environment on admin projects. Current project: ${testInfo.project.name}`);

	const { env, adminBaseUrl, pupilBaseUrl } = getEnvironmentUrls(testInfo);
	const adminUsername = process.env.ADMIN_USERNAME ?? 'teacher2';
	const adminPassword = process.env.ADMIN_PASSWORD ?? 'password';
	const targetPupilName = env === 'dev'
		? 'Mcclure, Molly'
		: env === 'test'
			? 'Gill, Sherri'
			: env === 'preprod'
				? 'McTesterson, Testy'
			: 'Mcclure, Molly';

	test.setTimeout(8 * 60 * 1000);

	await page.goto(`${adminBaseUrl}/sign-in`);
	const userNameField = page.getByRole('textbox', { name: 'Enter your user name.' });
	if (await userNameField.isVisible({ timeout: 2000 }).catch(() => false)) {
		if (env === 'preprod' && (adminUsername === 'teacher2' || adminPassword === 'password')) {
			throw new Error('Preprod login page is shown and default credentials are not valid. Provide ADMIN_USERNAME and ADMIN_PASSWORD or refresh auth.json.');
		}

		await userNameField.fill(adminUsername);
		await page.getByRole('textbox', { name: 'Enter your password.' }).fill(adminPassword);
		await page.getByRole('button', { name: 'Sign in' }).click();
	}

	await expect(page).toHaveURL(/admin|multiplication-tables-check\.service\.gov\.uk/);

	await page
		.getByRole('link', { name: /generate school passwords? and PINs? for the official check|generate and view password and PINs for the try it out and official check/i })
		.or(page.getByRole('button', { name: /generate school passwords? and PINs? for the official check|generate and view password and PINs for the try it out and official check/i }))
		.first()
		.click();

	const officialCheckEntry = page
		.getByRole('button', { name: 'Official check' })
		.or(page.getByRole('link', { name: 'Official check' }))
		.first();
	await officialCheckEntry.click();

	await page
		.getByRole('link', { name: /generate password and PINs for the official check/i })
		.or(page.getByRole('button', { name: /generate password and PINs for the official check/i }))
		.first()
		.click();

	await continueAdminSessionIfPrompted(page);
	await selectPupilByName(page, targetPupilName);
	await continueAdminSessionIfPrompted(page);
	await proceedAfterPupilSelection(page, targetPupilName);

	await page.waitForURL(/view-and-custom-print-live-pins/, { timeout: 20000 });
	await continueAdminSessionIfPrompted(page);
	await ensurePinsAreVisible(page, targetPupilName);

	const escapedTargetPupil = targetPupilName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
	const pupilRow = page.getByRole('row').filter({ hasText: new RegExp(escapedTargetPupil, 'i') }).first();
	await pupilRow.waitFor({ state: 'visible', timeout: 15000 });
	const rowText = await pupilRow.innerText();

	const schoolPassword = rowText.match(/School Password:\s*([A-Za-z0-9]+)/i)?.[1] ?? '';
	const pin = rowText.match(/PIN:\s*(\d+)/i)?.[1] ?? '';

	expect(schoolPassword, 'School Password should be present in selected pupil row').not.toBe('');
	expect(pin, 'PIN should be present in selected pupil row').not.toBe('');

	await page.goto(`${pupilBaseUrl}/sign-in`);
	await page.getByLabel('School password').fill(schoolPassword);
	await page.getByLabel('PIN').fill(pin);
	await page.getByRole('button', { name: 'Sign in' }).click();
	await validateColourContrastRoutingAfterSignIn(page);
});
