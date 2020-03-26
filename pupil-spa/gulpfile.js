const gulp = require('gulp')
const replace = require('gulp-string-replace')
const file = require('gulp-file')
const path = require('path')
const fs = require('fs')
const globalDotEnvFile = path.join(__dirname, '..', '.env')

try {
  if (fs.existsSync(globalDotEnvFile)) {
    console.log('globalDotEnvFile found', globalDotEnvFile)
    require('dotenv').config({ path: globalDotEnvFile })
  } else {
    console.log('No .env file found at project root')
  }
} catch (error) {
  console.error(error)
}

gulp.task('setRuntimeConfigURL', () => {
  console.log('Attempting to update runtime config URL from the environment...')
  console.log('env.RUNTIME_CONFIG_URL is:', process.env.RUNTIME_CONFIG_URL)
  if (process.env.RUNTIME_CONFIG_URL) {
    return gulp.src(['./src/app/services/config/config.service.ts'])
      .pipe(replace('/public/config.json', process.env.RUNTIME_CONFIG_URL))
      .pipe(gulp.dest('./src/app/services/config/'))
  }
})

gulp.task('createConfigFile', () => {
  const config = {
    applicationInsightsInstrumentationKey: null, // empty string?
    authUrl: process.env.AUTH_URL || 'http://localhost:3003/auth',
    authPingUrl: process.env.AUTH_PING_URL || 'http://localhost:3003/ping',
    checkStartAPIErrorDelay: process.env.CHECK_START_ERROR_DELAY || 2000,
    checkStartAPIErrorMaxAttempts: process.env.CHECK_START_MAX_ATTEMPTS || 3,
    checkSubmissionAPIErrorDelay: process.env.CHECK_SUBMISSION_ERROR_DELAY || 30000,
    checkSubmissionAPIErrorMaxAttempts: process.env.CHECK_SUBMISSION_MAX_ATTEMPTS || 3,
    connectivityCheckEnabled: process.env.CONNECTIVITY_CHECK_ENABLED || false,
    connectivityCheckViewMinDisplay: process.env.CONNECTIVITY_CHECK_MIN_DISPLAY || 6000,
    feedbackAPIErrorDelay: process.env.CHECK_SUBMISSION_ERROR_DELAY || 3000,
    feedbackAPIErrorMaxAttempts: process.env.CHECK_SUBMISSION_MAX_ATTEMPTS || 3,
    googleAnalyticsTrackingCode: process.env.GA_CODE || null, // empty string?
    loginPendingViewMinDisplay: process.env.LOGIN_PENDING_MIN_DISPLAY || 750,
    production: process.env.PRODUCTION || false,
    pupilPrefsAPIErrorDelay: process.env.CHECK_SUBMISSION_ERROR_DELAY || 3000, // why not in bash version?
    pupilPrefsAPIErrorMaxAttempts: process.env.CHECK_SUBMISSION_MAX_ATTEMPTS || 3, // why not in bash version?
    submissionPendingViewMinDisplay: process.env.SUBMISSION_PENDING_MIN_DISPLAY || 6000,
    submitsToCheckReceiver: process.env.SUBMITS_TO_CHECK_RECEIVER || false,
    supportNumber: process.env.SUPPORT_NUMBER || '0300 303 3013',
    testPupilConnectionQueueName: process.env.TEST_PUPIL_CONNECTION_QUEUE_NAME || 'test-pupil-connection',
    testPupilConnectionQueueUrl: process.env.TEST_PUPIL_CONNECTION_QUEUE_URL || '',
    testPupilConnectionQueueToken: process.env.TEST_PUPIL_CONNECTION_QUEUE_TOKEN || '',
    testPupilConnectionDelay: process.env.TEST_PUPIL_CONNECTION_ERROR_DELAY || 3000,
    testPupilConnectionMaxAttempts: process.env.TEST_PUPIL_CONNECTION_MAX_ATTEMPTS || 1,
    websiteOffline: process.env.WEBSITE_OFFLINE || false
  }
  const bufferised = Buffer.from(JSON.stringify(config))
  return file('config.json', bufferised, { src: true })
    .pipe(gulp.dest('src/public'))
})
