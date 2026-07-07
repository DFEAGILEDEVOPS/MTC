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

async function getCurrentQuestionText(page: Page): Promise<string> {
  // Multiplication prompt format is like: "3 x 4 =" or "3 × 4 =".
  const question = page.locator('text=/\\d+\\s*[x×]\\s*\\d+\\s*=/').first();
  await question.waitFor({ state: 'visible', timeout: 7000 });
  return (await question.innerText()).trim();
}

async function answerQuestion(page: Page): Promise<string> {
  // Read the currently shown question.
  const questionText = await getCurrentQuestionText(page);
  const match = questionText.match(/(\d+)\s*[x×]\s*(\d+)\s*=/);

  if (!match) {
    throw new Error(`Unable to parse multiplication question from: "${questionText}"`);
  }

  // Calculate and submit the answer via the on-screen keypad.
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

  // Answer a fixed number of timed questions.
  for (let i = 0; i < count; i += 1) {
    // Wait for the next question text so we do not double-submit the same prompt.
    for (let retry = 0; retry < 30; retry += 1) {
      if (await clickNextBetweenQuestionsIfPresent(page)) {
        await page.waitForTimeout(150);
        continue;
      }

      let current: string;
      try {
        current = await getCurrentQuestionText(page);
      } catch {
        if (await clickNextBetweenQuestionsIfPresent(page)) {
          await page.waitForTimeout(150);
          continue;
        }
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
      return answeredCount;
    }

    let answeredThisTurn = false;
    for (let retry = 0; retry < 30; retry += 1) {
      if (await isOnFinishScreen(page)) {
        return answeredCount;
      }

      if (await clickNextBetweenQuestionsIfPresent(page)) {
        await page.waitForTimeout(150);
        continue;
      }

      let current: string;
      try {
        current = await getCurrentQuestionText(page);
      } catch {
        if (await isOnFinishScreen(page)) {
          return answeredCount;
        }
        if (await clickNextBetweenQuestionsIfPresent(page)) {
          await page.waitForTimeout(150);
          continue;
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

async function continueAdminSessionIfPrompted(page: Page): Promise<void> {
  // Admin can show a session keep-alive modal; accept it when present.
  const sessionPromptYes = page.getByRole('button', { name: 'Yes', exact: true });
  if (await sessionPromptYes.isVisible({ timeout: 1500 }).catch(() => false)) {
    await sessionPromptYes.click();
  }
}

async function clickThroughNextUntilStartNow(page: Page, maxNextClicks = 10): Promise<void> {
  const startNowButton = page.getByRole('button', { name: 'Start now', exact: true });

  for (let i = 0; i <= maxNextClicks; i += 1) {
    if (await startNowButton.isVisible({ timeout: 400 }).catch(() => false)) {
      await startNowButton.click();
      return;
    }

    const nextButton = page.getByRole('button', { name: 'Next', exact: true });
    if (await nextButton.isVisible({ timeout: 400 }).catch(() => false)) {
      await nextButton.click();
      continue;
    }

    await page.waitForTimeout(200);
  }

  throw new Error(`Could not find 'Start now' after ${maxNextClicks} 'Next' click(s).`);
}

async function proceedAfterPupilSelection(page: Page, adminBaseUrl: string): Promise<void> {
  // Confirm selected pupils on the sticky footer. Fallback to direct navigation if hidden.
  const confirmButton = page.getByRole('button', { name: 'Confirm' }).or(page.locator('button:has-text("Confirm")')).first();

  try {
    await confirmButton.scrollIntoViewIfNeeded({ timeout: 5000 });
    await confirmButton.click({ timeout: 5000 });
  } catch {
    await page.goto(`${adminBaseUrl}/pupil-pin/view-and-custom-print-live-pins`);
  }
}

async function getPupilsCompletedCount(page: Page): Promise<number> {
  const parseCount = (text: string): number | null => {
    const normalized = text.replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim();
    const completionMatch = normalized.match(/Pupils completed\s+([\d,]+)\s+of\s+[\d,]+\s+pupils/i);
    if (!completionMatch) {
      return null;
    }
    return Number(completionMatch[1].replace(/,/g, ''));
  };

  const completionLabel = page.getByText(/Pupils completed/i).first();
  await completionLabel.waitFor({ state: 'visible', timeout: 10000 });

  const candidateTexts: string[] = [];

  const labelText = await completionLabel.innerText().catch(() => '');
  if (labelText) {
    candidateTexts.push(labelText);
  }

  const containerText = await completionLabel
    .locator('xpath=ancestor::*[self::section or self::div or self::li][1]')
    .innerText()
    .catch(() => '');
  if (containerText) {
    candidateTexts.push(containerText);
  }

  const bodyText = await page.locator('body').innerText();
  candidateTexts.push(bodyText);

  for (const candidate of candidateTexts) {
    const parsed = parseCount(candidate);
    if (parsed !== null) {
      return parsed;
    }
  }

  const debugSnippet = candidateTexts
    .map((text, index) => `[candidate ${index + 1}] ${text.replace(/\s+/g, ' ').trim().slice(0, 300)}`)
    .join(' | ');
  throw new Error(`Unable to parse pupils completed count. Debug text: ${debugSnippet}`);
}

async function ensurePinsAreVisible(page: Page, adminBaseUrl: string): Promise<void> {
  // Ensure we actually have at least one generated row with School Password + PIN.
  await continueAdminSessionIfPrompted(page);

  const pupilRows = page.getByRole('row', { name: /School Password:/i });
  if ((await pupilRows.count()) > 0) {
    return;
  }

  // If no rows are present, regenerate from the official live pin selection page.
  await page.goto(`${adminBaseUrl}/pupil-pin/generate-live-pins-list`);
  await continueAdminSessionIfPrompted(page);

  const firstPupilCheckbox = page.getByRole('checkbox', { name: /Tick pupil/i }).first();
  await firstPupilCheckbox.click();
  await continueAdminSessionIfPrompted(page);

  // Sticky confirm can be hidden/off-screen in headed mode; click via DOM as fallback.
  const clicked = await page.evaluate(() => {
    const button = document.querySelector<HTMLButtonElement>('#stickyConfirm, button.govuk-form-button');
    if (!button) return false;
    button.click();
    return true;
  });

  if (!clicked) {
    await proceedAfterPupilSelection(page, adminBaseUrl);
  }

  await page.waitForURL(/view-and-custom-print-live-pins/, { timeout: 20000 });
  await continueAdminSessionIfPrompted(page);
}

test('admin generates credentials, pupil completes official check flow and admin verifies completion', async ({ page }, testInfo) => {
  test.skip(!testInfo.project.name.endsWith('-check'), `Runs only on *-check projects. Current project: ${testInfo.project.name}`);

  const { env, adminBaseUrl, pupilBaseUrl } = getEnvironmentUrls(testInfo);

  // Full flow can take a few minutes due to timed question pages.
  test.setTimeout(8 * 60 * 1000);

  // Step 1-2: Open admin and sign in only if we are not already authenticated.
  await page.goto(`${adminBaseUrl}/sign-in`);
  const userNameField = page.getByRole('textbox', { name: 'Enter your user name.' });

  if (await userNameField.isVisible({ timeout: 2000 }).catch(() => false)) {
    if (env === 'preprod') {
      throw new Error(
        'PREPROD AUTH EXPIRED: The login page was shown despite auth.json storageState being set. ' +
        'Session cookies have likely expired. To fix:\n' +
        '  1. Run `npm run save:auth` from the repo root and complete the DfE Sign-in flow\n' +
        '  2. Base64-encode the new auth.json: `base64 -i auth.json | tr -d \'\\n\'`\n' +
        '  3. Update the AUTH_JSON_CONTENT secret variable in Azure DevOps and re-run the pipeline'
      );
    }

    await userNameField.fill(process.env.ADMIN_USERNAME ?? 'teacher2');
    await page.getByRole('textbox', { name: 'Enter your password.' }).fill(process.env.ADMIN_PASSWORD ?? 'password');
    await page.getByRole('button', { name: 'Sign in' }).click();
  }

  await expect(page).toHaveURL(/admin|multiplication-tables-check\.service\.gov\.uk/);

  // Step 3: Check current completion count before generating pins.
  await page.getByRole('link', { name: 'See how many of your pupils have completed the official check' }).click();
  const numberOfPupilsCompleted = await getPupilsCompletedCount(page);
  console.log(`Pupils completed before check: ${numberOfPupilsCompleted}`);
  await page.goBack();

  // Step 4-5: Open official check PIN generation flow.
  await page.getByRole('link', { name: 'Generate and view password and PINs for the try it out and official check' }).click();
  await page.getByRole('button', { name: 'Official check' }).click();
  const generatePinsTrigger = page
    .getByRole('link', { name: 'Generate password and PINs for the official check' })
    .or(page.getByRole('button', { name: 'Generate password and PINs for the official check' }))
    .first();
  await generatePinsTrigger.click();

  await continueAdminSessionIfPrompted(page);

  // Step 6: Select the first available pupil and confirm selection.
  const firstPupilCheckbox = page.getByRole('checkbox', { name: /Tick pupil/i }).first();
  await firstPupilCheckbox.click();
  await continueAdminSessionIfPrompted(page);
  await proceedAfterPupilSelection(page, adminBaseUrl);
  await ensurePinsAreVisible(page, adminBaseUrl);

  // Step 7: Read generated school password and PIN from the first visible row.
  const pupilRow = page.getByRole('row', { name: /School Password:/i }).first();

  const rowText = await pupilRow.innerText();
  const schoolPassword = rowText.match(/School Password:\s*([A-Za-z0-9]+)/i)?.[1] ?? '';
  const pin = rowText.match(/PIN:\s*(\d+)/i)?.[1] ?? '';

  // Step 8: Sign in to pupil app with generated credentials.
  await page.goto(`${pupilBaseUrl}/sign-in`);
  await page.getByLabel('School password').fill(schoolPassword);
  await page.getByLabel('PIN').fill(pin);
  await page.getByRole('button', { name: 'Sign in' }).click();

  // Step 9-10: Move through intro screens and start practice.
  await clickThroughNextUntilStartNow(page);

  // Step 11: Answer 3 practice questions.
  await answerQuestions(page, 3);

  // Step 12-13: Continue and start official check.
  await clickThroughNextUntilStartNow(page);

  // Step 14: Answer official questions until the finish screen appears.
  const officialQuestionsAnswered = await answerQuestionsUntilFinished(page);
  console.log(`Official questions answered before finish: ${officialQuestionsAnswered}`);

  // Step 16: Sign out.
  const signOutButton = page.getByRole('button', { name: 'Sign out' });
  if (await signOutButton.count()) {
    await signOutButton.first().click();
  } else {
    await page.getByRole('link', { name: 'Sign out' }).click();
  }

  // Step 17: Return to admin and sign in again with the same credentials.
  await page.goto(`${adminBaseUrl}/sign-in`);
  const userNameFieldPostCheck = page.getByRole('textbox', { name: 'Enter your user name.' });
  if (await userNameFieldPostCheck.isVisible({ timeout: 2000 }).catch(() => false)) {
    await userNameFieldPostCheck.fill(process.env.ADMIN_USERNAME ?? 'teacher2');
    await page.getByRole('textbox', { name: 'Enter your password.' }).fill(process.env.ADMIN_PASSWORD ?? 'password');
    await page.getByRole('button', { name: 'Sign in' }).click();
  }
  await expect(page).toHaveURL(/admin|multiplication-tables-check\.service\.gov\.uk/);

  // Step 18: Verify the completion count has increased by 1.
  await page.getByRole('link', { name: 'See how many of your pupils have completed the official check' }).click();
  const expectedCompletedCount = numberOfPupilsCompleted + 1;
  await expect
    .poll(
      async () => {
        await page.reload();
        return getPupilsCompletedCount(page);
      },
      {
        timeout: 45000,
        intervals: [1000, 2000, 3000],
        message: `Expected pupils completed count to reach ${expectedCompletedCount}`,
      },
    )
    .toBe(expectedCompletedCount);
  const numberOfPupilsCompletedAfter = await getPupilsCompletedCount(page);
  console.log(`Pupils completed after check: ${numberOfPupilsCompletedAfter}`);
});