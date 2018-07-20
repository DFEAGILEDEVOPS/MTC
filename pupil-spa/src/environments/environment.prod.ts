export const environment = {
  apiURL: 'API_URL',
  checkStartedURL: 'CHECK_STARTED_URL',
  authURL: 'AUTH_URL',
  checkSubmissionURL: 'CHECK_SUBMISSION_URL',
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
  submissionPendingViewMinDisplay: 6000,
  // Contact number in case check submission fails
  supportNumber: '0345 278 8080',
  googleAnalyticsTrackingCode: 'GA_CODE',
  applicationInsightsInstrumentationKey: 'APP_INSIGHTS_CODE'
};
