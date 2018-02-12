export const environment = {
  apiURL: 'API_URL',
  production: true,
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
  submissionPendingViewMinDisplay: 2000,
  // Contact number in case check submission fails
  supportNumber: '0345 278 8080',
  googleAnalyticsTrackingCode: 'UA-92976848-11'
};
