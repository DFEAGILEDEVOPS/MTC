// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

export const environment = {
  apiURL: 'http://localhost:3001',
  authURL: 'http://localhost:3001/api/questions',
  // authURL: 'http://localhost:3003/auth',
  checkStartedURL: 'http://localhost:3001/api/check-started',
  // checkStartedURL: 'http://localhost:3004/submit',
  checkSubmissionURL: 'http://localhost:3001/api/completed-check',
  // checkSubmissionURL: 'http://localhost:3005/submit',
  production: false,
  // api/check-started
  // Delay (ms) during retries
  checkStartAPIErrorDelay: 2000,
  // Max attempts
  checkStartAPIErrorMaxAttempts: 3,
  // api/completed-check
  // Delay (ms) during retries
  checkSubmissionApiErrorDelay: 30000,
  // Max attempts
  checkSubmissionAPIErrorMaxAttempts: 10,
  // Minimum display time for submission pending view
  submissionPendingViewMinDisplay: 6000,
  // Contact number in case check submission fails
  supportNumber: '0345 278 8080',
  googleAnalyticsTrackingCode: null
};
