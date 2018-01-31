export const environment = {
  apiURL: 'API_URL',
  production: true,
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
