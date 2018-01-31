// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

export const environment = {
  apiURL: 'http://localhost:3001',
  production: false,
  // Delay and max attempts for /api/completed-check api post method
  checkStartAPIErrorDelay: 2000,
  checkStartAPIErrorMaxAttempts: 3,
  // Delay and max attempts for /api/check-started api post method
  checkSubmissionApiErrorDelay: 30000,
  checkSubmissionAPIErrorMaxAttempts: 10,
  submissionPendingViewMinDisplay: 2000,
  // Contact number in case check submission fails
  supportNumber: '0345 278 8080'
};
