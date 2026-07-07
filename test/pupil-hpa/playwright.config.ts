import { defineConfig, type ReporterDescription } from '@playwright/test';

const isCI = process.env.CI === '1' || process.env.CI === 'true';
const teamsNotificationsEnabled = process.env.TEAMS_ENABLE_NOTIFICATIONS === 'true';

// Use single auth file for all tests
const authStorageState = '../../auth.json';

export const environmentUrls = {
  dev: {
    adminBaseUrl: 'https://devadmin-as-mtc.azurewebsites.net',
    pupilBaseUrl: 'https://devpupil-as-mtc.azurewebsites.net'
  },
  test: {
    adminBaseUrl: 'https://testadmin-as-mtc.azurewebsites.net',
    pupilBaseUrl: 'https://testpupil-as-mtc.azurewebsites.net'
  },
  preprod: {
    adminBaseUrl: 'https://pp-admin.multiplication-tables-check.service.gov.uk',
    pupilBaseUrl: 'https://pp-pupil.multiplication-tables-check.service.gov.uk'
  }
};

export default defineConfig({
  testDir: '.',
  testMatch: '*.playwright.spec.ts',
  fullyParallel: false,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers: 1,
  timeout: 90_000,
  expect: {
    timeout: 10_000
  },
  reporter: (() => {
    const reporters: ReporterDescription[] = [
      isCI ? ['line'] : ['list'],
      ['html', { open: 'never' }],
    ];

    // Teams reporting is opt-in to avoid accidental notifications from CI or branch runs.
    if (teamsNotificationsEnabled && process.env.TEAMS_WEBHOOK_URL && process.env.TEAMS_DISABLE_NOTIFICATIONS !== 'true') {
      reporters.push(['./teams-reporter.js']);
    }

    return reporters;
  })(),
  outputDir: 'test-results',
  use: {
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 10_000,
    navigationTimeout: 30_000
  },

  projects: [
    //dev
    {
      name: 'dev-preflight',
      testMatch: 'ensure-environment-preflight.setup.playwright.ts',
      use: { baseURL: 'https://devadmin-as-mtc.azurewebsites.net' },
    },
    {
      name: 'dev-setup',
      testMatch: 'ensure-pupil.setup.playwright.ts',
      dependencies: ['dev-preflight'],
      use: { baseURL: 'https://devadmin-as-mtc.azurewebsites.net' },
    },
    {
      name: 'dev-accessibility-setup',
      testMatch: 'ensure-accessibility-pupil.setup.playwright.ts',
      dependencies: ['dev-preflight'],
      use: { baseURL: 'https://devadmin-as-mtc.azurewebsites.net' },
    },
    {
      name: 'dev-admin',
      testIgnore: [
        'mtc-signin-and-check.playwright.spec.ts',
        'mtc-signin-and-try-it-out.playwright.spec.ts',
        'mtc-accessibility-check.playwright.spec.ts',
      ],
      dependencies: ['dev-preflight'],
      use: { baseURL: 'https://devadmin-as-mtc.azurewebsites.net' },
    },
    {
      name: 'dev-check',
      testMatch: [
        'mtc-signin-and-check.playwright.spec.ts',
        'mtc-signin-and-try-it-out.playwright.spec.ts',
      ],
      dependencies: ['dev-setup'],
      use: { baseURL: 'https://devadmin-as-mtc.azurewebsites.net' },
    },
    {
      name: 'dev-accessibility',
      testMatch: 'mtc-accessibility-check.playwright.spec.ts',
      dependencies: ['dev-accessibility-setup'],
      use: { baseURL: 'https://devadmin-as-mtc.azurewebsites.net' },
    },
    //test
    {
      name: 'test-preflight',
      testMatch: 'ensure-environment-preflight.setup.playwright.ts',
      use: { baseURL: 'https://testadmin-as-mtc.azurewebsites.net' },
    },
    {
      name: 'test-setup',
      testMatch: 'ensure-pupil.setup.playwright.ts',
      dependencies: ['test-preflight'],
      use: { baseURL: 'https://testadmin-as-mtc.azurewebsites.net' },
    },
    {
      name: 'test-accessibility-setup',
      testMatch: 'ensure-accessibility-pupil.setup.playwright.ts',
      dependencies: ['test-preflight'],
      use: { baseURL: 'https://testadmin-as-mtc.azurewebsites.net' },
    },
    {
      name: 'test-admin',
      testIgnore: [
        'mtc-signin-and-check.playwright.spec.ts',
        'mtc-signin-and-try-it-out.playwright.spec.ts',
        'mtc-accessibility-check.playwright.spec.ts',
      ],
      dependencies: ['test-preflight', 'test-accessibility-setup'],
      use: { baseURL: 'https://testadmin-as-mtc.azurewebsites.net' },
    },
    {
      name: 'test-check',
      testMatch: [
        'mtc-signin-and-check.playwright.spec.ts',
        'mtc-signin-and-try-it-out.playwright.spec.ts',
      ],
      dependencies: ['test-setup'],
      use: { baseURL: 'https://testadmin-as-mtc.azurewebsites.net' },
    },
    {
      name: 'test-accessibility',
      testMatch: 'mtc-accessibility-check.playwright.spec.ts',
      dependencies: ['test-accessibility-setup'],
      use: { baseURL: 'https://testadmin-as-mtc.azurewebsites.net' },
    },
    //preprod (with auth)
    {
        name: 'preprod-check',
        use: { 
            baseURL: 'https://pp-admin.multiplication-tables-check.service.gov.uk',
            storageState: authStorageState,
        }
    },
  ],
});