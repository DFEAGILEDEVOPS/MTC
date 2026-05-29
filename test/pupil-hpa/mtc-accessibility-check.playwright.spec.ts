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

async function assertHighContrastEnabled(page: Page, context: string): Promise<void> {
	const root = page.locator('#page-modifications');
	await root.waitFor({ state: 'visible', timeout: 10000 });

	const className = await root.getAttribute('class');
	const contrastMatch = className?.match(/colour-contrast-([a-z]+)/i);
	const contrastMode = contrastMatch?.[1]?.toLowerCase();

	if (!contrastMode) {
		throw new Error(`[${context}] Could not determine contrast mode from #page-modifications class: '${className ?? 'missing'}'.`);
	}

	if (contrastMode === 'bow') {
		throw new Error(`[${context}] High contrast is not enabled. Current mode is '${contrastMode}' (Black on white).`);
	}
}

async function continueAdminSessionIfPrompted(page: Page): Promise<void> {
	const sessionPromptYes = page.getByRole('button', { name: 'Yes', exact: true });
	if (await sessionPromptYes.isVisible({ timeout: 1500 }).catch(() => false)) {
		await sessionPromptYes.click();
	}
}

async function getCurrentQuestionText(page: Page): Promise<string> {
	const question = page.locator('text=/\\d+\\s*[x×]\\s*\\d+\\s*=/').first();
	await question.waitFor({ state: 'visible', timeout: 7000 });
	return (await question.innerText()).trim();
}

async function answerQuestion(page: Page): Promise<string> {
	await assertHighContrastEnabled(page, 'question page before answer');

	const questionText = await getCurrentQuestionText(page);
	const match = questionText.match(/(\d+)\s*[x×]\s*(\d+)\s*=/);

	if (!match) {
		throw new Error(`Unable to parse multiplication question from: '${questionText}'`);
	}

	const answer = String(Number(match[1]) * Number(match[2]));
	for (const digit of answer) {
		await page.getByRole('button', { name: digit, exact: true }).click();
	}

	await page.getByRole('button', { name: 'Enter', exact: true }).click();
	return questionText;
}

async function clickNextBetweenQuestionsIfPresent(page: Page, timeout = 300): Promise<boolean> {
	const nextButton = page.getByRole('button', { name: 'Next', exact: true });
	if (await nextButton.isVisible({ timeout }).catch(() => false)) {
		await nextButton.click();
		return true;
	}

	return false;
}

async function answerQuestions(page: Page, count: number): Promise<void> {
	let previousQuestion = '';

	for (let i = 0; i < count; i += 1) {
		for (let retry = 0; retry < 30; retry += 1) {
			if (await clickNextBetweenQuestionsIfPresent(page)) {
				await page.waitForTimeout(150);
				await assertHighContrastEnabled(page, `practice question ${i + 1}: after Next click`);
				continue;
			}

			let current: string;
			try {
				current = await getCurrentQuestionText(page);
			} catch {
				await page.waitForTimeout(200);
				continue;
			}

			if (current !== previousQuestion || i === 0) {
				previousQuestion = await answerQuestion(page);
				break;
			}
			await page.waitForTimeout(200);
		}
	}
}

async function isOnFinishScreen(page: Page): Promise<boolean> {
	if (page.url().includes('/check-complete')) {
		return true;
	}

	const thankYouHeading = page.getByRole('heading', { name: 'Thank you', level: 1 });
	if (await thankYouHeading.isVisible({ timeout: 300 }).catch(() => false)) {
		return true;
	}

	const finishedHeading = page.getByRole('heading', { name: 'You have finished' });
	return finishedHeading.isVisible({ timeout: 300 }).catch(() => false);
}

async function answerQuestionsUntilFinished(page: Page, maxQuestions = 60): Promise<number> {
	let previousQuestion = '';
	let answeredCount = 0;

	while (answeredCount < maxQuestions) {
		if (await isOnFinishScreen(page)) {
			await assertHighContrastEnabled(page, 'finish screen');
			return answeredCount;
		}

		let answeredThisTurn = false;
		for (let retry = 0; retry < 30; retry += 1) {
			if (await isOnFinishScreen(page)) {
				await assertHighContrastEnabled(page, 'finish screen');
				return answeredCount;
			}

			if (await clickNextBetweenQuestionsIfPresent(page)) {
				await page.waitForTimeout(150);
				await assertHighContrastEnabled(page, `official question ${answeredCount + 1}: after Next click`);
				continue;
			}

			let current: string;
			try {
				current = await getCurrentQuestionText(page);
			} catch {
				if (await isOnFinishScreen(page)) {
					await assertHighContrastEnabled(page, 'finish screen');
					return answeredCount;
				}
				await page.waitForTimeout(200);
				continue;
			}

			if (current !== previousQuestion) {
				previousQuestion = await answerQuestion(page);
				answeredCount += 1;
				answeredThisTurn = true;
				break;
			}

			await page.waitForTimeout(200);
		}

		if (!answeredThisTurn) {
			throw new Error(`Timed out waiting for next question or finish screen after answering ${answeredCount} official question(s).`);
		}
	}

	throw new Error(`Exceeded safety limit of ${maxQuestions} official question(s) without reaching finish screen.`);
}

async function clickThroughNextUntilStartNow(page: Page, context: string, maxNextClicks = 12): Promise<void> {
	const startNowButton = page.getByRole('button', { name: 'Start now', exact: true });

	for (let i = 0; i <= maxNextClicks; i += 1) {
		await assertHighContrastEnabled(page, `${context}: screen ${i + 1}`);

		if (await startNowButton.isVisible({ timeout: 400 }).catch(() => false)) {
			await startNowButton.click();
			return;
		}

		const nextButton = page.getByRole('button', { name: 'Next', exact: true });
		if (await nextButton.isVisible({ timeout: 400 }).catch(() => false)) {
			await nextButton.click();
			await page.waitForTimeout(250);
			continue;
		}

		await page.waitForTimeout(250);
	}

	throw new Error(`Could not find 'Start now' after ${maxNextClicks} 'Next' click(s).`);
}

async function selectPupilByName(page: Page, pupilName: string): Promise<void> {
	const escaped = pupilName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
	const row = page.getByRole('row', { name: new RegExp(escaped, 'i') }).first();

	await row.waitFor({ state: 'visible', timeout: 15000 });

	const checkboxInRow = row.getByRole('checkbox').first();
	if (await checkboxInRow.isVisible().catch(() => false)) {
		await checkboxInRow.check().catch(async () => checkboxInRow.click({ force: true }));
		return;
	}

	const checkboxByLabel = page.getByRole('checkbox', { name: new RegExp(escaped, 'i') }).first();
	await checkboxByLabel.waitFor({ state: 'visible', timeout: 7000 });
	await checkboxByLabel.check().catch(async () => checkboxByLabel.click({ force: true }));
}

test('admin generates creds and pupil completes official check with high contrast enabled throughout', async ({ page }, testInfo) => {
	test.skip(!testInfo.project.name.endsWith('-admin'), `Runs once per environment on admin projects. Current project: ${testInfo.project.name}`);

	const { env, adminBaseUrl, pupilBaseUrl } = getEnvironmentUrls(testInfo);
	const adminUsername = process.env.ADMIN_USERNAME ?? 'teacher2';
	const adminPassword = process.env.ADMIN_PASSWORD ?? 'password';
	const targetPupilName = env === 'dev'
		? 'Mcclure, Molly'
		: env === 'test'
			? 'Browning, Carson'
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
		.getByRole('link', { name: /generate school passwords and PINs for the official check|generate and view password and PINs for the try it out and official check/i })
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
	await page.getByRole('button', { name: 'Confirm' }).first().click();

	await page.waitForURL(/view-and-custom-print-live-pins/, { timeout: 20000 });
	await continueAdminSessionIfPrompted(page);

	const pupilRow = page.getByRole('row', { name: new RegExp(targetPupilName, 'i') }).first();
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

	await assertHighContrastEnabled(page, 'after pupil sign in');

	await clickThroughNextUntilStartNow(page, 'before practice');
	await answerQuestions(page, 3);

	await clickThroughNextUntilStartNow(page, 'before official check');
	const officialQuestionsAnswered = await answerQuestionsUntilFinished(page);
	console.log(`Official questions answered before finish: ${officialQuestionsAnswered}`);
});
