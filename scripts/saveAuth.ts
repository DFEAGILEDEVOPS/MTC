import { chromium } from "@playwright/test";
import * as readline from "readline";

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  const loginUrl = 'https://pp-admin.multiplication-tables-check.service.gov.uk/sign-in';

  await page.goto(loginUrl);

  console.log(
    "🔐 Please complete the login manually, then press ENTER to save the session..."
  );

  // Wait for user to press ENTER
  await new Promise<void>((resolve) => {
    readline
      .createInterface({
        input: process.stdin,
        output: process.stdout,
      })
      .question("Press ENTER when login is complete...", () => {
        resolve();
      });
  });

  await context.storageState({ path: "auth.json" });
  await browser.close();

  console.log("✅ Auth session saved to auth.json");
})();
