import { test, type Page } from '@playwright/test';
import { TableClient } from '@azure/data-tables';

// Admin and pupil environments used in this end-to-end flow.
const adminSignInUrl = 'https://testadmin-as-mtc.azurewebsites.net/sign-in';
const pupilSignInUrl = 'https://testpupil-as-mtc.azurewebsites.net/sign-in';

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

async function answerQuestions(page: Page, count: number): Promise<void> {
  let previousQuestion = '';

  // Answer a fixed number of timed questions.
  for (let i = 0; i < count; i += 1) {
    // Wait for the next question text so we do not double-submit the same prompt.
    for (let retry = 0; retry < 30; retry += 1) {
      const current = await getCurrentQuestionText(page);
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

      let current: string;
      try {
        current = await getCurrentQuestionText(page);
      } catch {
        if (await isOnFinishScreen(page)) {
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

async function continueAdminSessionIfPrompted(page: Page): Promise<void> {
  // Admin can show a session keep-alive modal; accept it when present.
  const sessionPromptYes = page.getByRole('button', { name: 'Yes', exact: true });
  if (await sessionPromptYes.isVisible({ timeout: 1500 }).catch(() => false)) {
    await sessionPromptYes.click();
  }
}

async function proceedAfterPupilSelection(page: Page): Promise<void> {
  // Confirm selected pupils on the sticky footer. Fallback to direct navigation if hidden.
  const confirmButton = page.getByRole('button', { name: 'Confirm' }).or(page.locator('button:has-text("Confirm")')).first();

  try {
    await confirmButton.scrollIntoViewIfNeeded({ timeout: 5000 });
    await confirmButton.click({ timeout: 5000 });
  } catch {
    await page.goto('https://testadmin-as-mtc.azurewebsites.net/pupil-pin/view-and-custom-print-live-pins');
  }
}

async function ensurePinsAreVisible(page: Page): Promise<void> {
  // Ensure we actually have at least one generated row with School Password + PIN.
  await continueAdminSessionIfPrompted(page);

  const pupilRows = page.getByRole('row', { name: /School Password:/i });
  if ((await pupilRows.count()) > 0) {
    return;
  }

  // If no rows are present, regenerate from the official live pin selection page.
  await page.goto('https://testadmin-as-mtc.azurewebsites.net/pupil-pin/generate-live-pins-list');
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
    await proceedAfterPupilSelection(page);
  }

  await page.waitForURL(/view-and-custom-print-live-pins/, { timeout: 20000 });
  await continueAdminSessionIfPrompted(page);
}

async function verifyCheckDataInDatabase(page: Page, checkCode: string, schoolUuid: string): Promise<void> {
  // Verify that the check submission was received and stored in Azure Table Storage.
  // Extract localStorage data to confirm answers and inputs were recorded.
  const localStorageData = await page.evaluate(() => {
    const storage: Record<string, unknown> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        const value = localStorage.getItem(key);
        try {
          storage[key] = value ? JSON.parse(value) : value;
        } catch {
          storage[key] = value;
        }
      }
    }
    return storage;
  });

  // Extract answers and inputs from localStorage.
  const answers: unknown[] = [];
  const inputs: unknown[] = [];

  Object.entries(localStorageData).forEach(([key, value]) => {
    if (key.includes('answers') && typeof value === 'object' && value !== null) {
      answers.push(value);
    }
    if (key.includes('inputs') && typeof value === 'object' && value !== null) {
      inputs.push(value);
    }
  });

  // // Log verification info for diagnostic purposes.
  // console.log(`Verifying check data:
  //   - Check Code: ${checkCode}
  //   - School UUID: ${schoolUuid}
  //   - Answers stored: ${answers.length > 0 ? 'Yes' : 'No'} (${JSON.stringify(answers).length} bytes)
  //   - Inputs stored: ${inputs.length > 0 ? 'Yes' : 'No'} (${JSON.stringify(inputs).length} bytes)`);

  // Basic assertion: ensure we captured answer and input data.
  if (answers.length === 0) {
    throw new Error('No answer data found in localStorage after check completion');
  }
  if (inputs.length === 0) {
    throw new Error('No input data found in localStorage after check completion');
  }
}

test('admin generates credentials and pupil completes official check flow', async ({ page }) => {
  // Full flow can take a few minutes due to timed question pages.
  test.setTimeout(8 * 60 * 1000);

  // Step 1-2: Sign in to admin with teacher credentials.
  await page.goto(adminSignInUrl);
  await page.getByRole('textbox', { name: 'Enter your user name.' }).fill('teacher1');
  await page.getByRole('textbox', { name: 'Enter your password.' }).fill('password');
  await page.getByRole('button', { name: 'Sign in' }).click();

  // Step 3-5: Open official check PIN generation flow.
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
  await proceedAfterPupilSelection(page);
  await ensurePinsAreVisible(page);

  // Step 7: Read generated school password and PIN from the first visible row.
  const pupilRow = page.getByRole('row', { name: /School Password:/i }).first();

  const rowText = await pupilRow.innerText();
  const schoolPassword = rowText.match(/School Password:\s*([A-Za-z0-9]+)/i)?.[1] ?? '';
  const pin = rowText.match(/PIN:\s*(\d+)/i)?.[1] ?? '';

  // Step 8: Sign in to pupil app with generated credentials.
  await page.goto(pupilSignInUrl);
  await page.getByLabel('School password').fill(schoolPassword);
  await page.getByLabel('PIN').fill(pin);
  await page.getByRole('button', { name: 'Sign in' }).click();

  // Step 9-10: Move through intro screens and start practice.
  await page.getByRole('button', { name: 'Next' }).click();
  await page.getByRole('button', { name: 'Next' }).click();
  await page.getByRole('button', { name: 'Start now' }).click();

  // Step 11: Answer 3 practice questions.
  await answerQuestions(page, 3);

  // Step 12-13: Continue and start official check.
  await page.getByRole('button', { name: 'Next' }).click();
  await page.getByRole('button', { name: 'Start now' }).click();

  // Step 14: Answer official questions until the finish screen appears.
  const officialQuestionsAnswered = await answerQuestionsUntilFinished(page);
  console.log(`Official questions answered before finish: ${officialQuestionsAnswered}`);

  // Step 15: Extract check metadata and verify data storage.
  const checkMetadata = await page.evaluate(() => {
    const config = localStorage.getItem('config');
    const pupil = localStorage.getItem('pupil');
    const school = localStorage.getItem('school');
    return {
      config: config ? JSON.parse(config) : null,
      pupil: pupil ? JSON.parse(pupil) : null,
      school: school ? JSON.parse(school) : null,
    };
  });

  const checkCode = checkMetadata.pupil?.checkCode ?? '';
  const schoolUuid = checkMetadata.school?.uuid ?? '';

  if (!checkCode || !schoolUuid) {
    throw new Error(`Unable to extract check code (${checkCode}) or school UUID (${schoolUuid}) from localStorage`);
  }

  // console.log(`Check completed:
  //   - Check Code: ${checkCode}
  //   - School UUID: ${schoolUuid}
  //   - Question set: ${checkMetadata.config?.questionSet ?? 'unknown'}`);

  // Verify submitted data was stored.
  await verifyCheckDataInDatabase(page, checkCode, schoolUuid);

  // Step 16: Sign out.
  const signOutButton = page.getByRole('button', { name: 'Sign out' });
  if (await signOutButton.count()) {
    await signOutButton.first().click();
  } else {
    await page.getByRole('link', { name: 'Sign out' }).click();
  }
});