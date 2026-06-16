import { defineConfig } from '@playwright/test';

const isCI = process.env.CI === '1' || process.env.CI === 'true';

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
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers: isCI ? 2 : undefined,
  timeout: 90_000,
  expect: {
    timeout: 10_000
  },
  reporter: isCI
    ? [['line'], ['html', { open: 'never' }]]
    : [['list'], ['html', { open: 'never' }]],
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
      name: 'dev-setup',
      testMatch: 'ensure-pupil.setup.playwright.ts',
      use: { baseURL: 'https://devadmin-as-mtc.azurewebsites.net' },
    },
    {
      name: 'dev-admin',
      testIgnore: [
        'mtc-signin-and-check.playwright.spec.ts',
        'mtc-signin-and-try-it-out.playwright.spec.ts',
        'mtc-accessibility-check.playwright.spec.ts',
      ],
      use: { baseURL: 'https://devadmin-as-mtc.azurewebsites.net' },
    },
    {
      name: 'dev-check',
      testMatch: [
        'mtc-signin-and-check.playwright.spec.ts',
        'mtc-signin-and-try-it-out.playwright.spec.ts',
        'mtc-accessibility-check.playwright.spec.ts',
      ],
      dependencies: ['dev-setup'],
      use: { baseURL: 'https://devadmin-as-mtc.azurewebsites.net' },
    },
    //test
    {
      name: 'test-setup',
      testMatch: 'ensure-pupil.setup.playwright.ts',
      use: { baseURL: 'https://testadmin-as-mtc.azurewebsites.net' },
    },
    {
      name: 'test-admin',
      testIgnore: [
        'mtc-signin-and-check.playwright.spec.ts',
        'mtc-signin-and-try-it-out.playwright.spec.ts',
        'mtc-accessibility-check.playwright.spec.ts',
      ],
      use: { baseURL: 'https://testadmin-as-mtc.azurewebsites.net' },
    },
    {
      name: 'test-check',
      testMatch: [
        'mtc-signin-and-check.playwright.spec.ts',
        'mtc-signin-and-try-it-out.playwright.spec.ts',
        'mtc-accessibility-check.playwright.spec.ts',
      ],
      dependencies: ['test-setup'],
      use: { baseURL: 'https://testadmin-as-mtc.azurewebsites.net' },
    },
    //preprod (with auth)
    {
        name: 'preprod-admin',
        use: { 
            baseURL: 'https://pp-admin.multiplication-tables-check.service.gov.uk' ,
        storageState: '../../auth.json', }
    },
  ],
});