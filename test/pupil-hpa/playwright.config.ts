import { defineConfig } from '@playwright/test';

const isCI = process.env.CI === '1' || process.env.CI === 'true';

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
      name: 'dev-admin',
      use: { baseURL: 'https://devadmin-as-mtc.azurewebsites.net' },
    },
    {
      name: 'dev-pupil',
      use: { baseURL: 'https://devpupil-as-mtc.azurewebsites.net' },
    },
    //test
    {
      name: 'test-admin',
      use: { baseURL: 'https://testadmin-as-mtc.azurewebsites.net' },
    },
    {
      name: 'test-pupil',
      use: { baseURL: 'https://testpupil-as-mtc.azurewebsites.net' },
    },
    //preprod (with auth)
    {
        name: 'preprod-admin',
        use: { 
            baseURL: 'https://pp-admin.multiplication-tables-check.service.gov.uk' ,
        storageState: '../../auth.json', }
    },
    {
        name: 'preprod-pupil',
        use: { 
            baseURL: 'https://pp-pupil.multiplication-tables-check.service.gov.uk' },
    }
  ],
});