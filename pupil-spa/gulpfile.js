const gulp = require('gulp')
const replace = require('gulp-string-replace')
require('dotenv').config()

gulp.task('setRuntimeConfigURL', () => {
  console.log('Attempting to update runtime config URL from the environment...')
  console.log('env.RUNTIME_CONFIG_URL is:', process.env.RUNTIME_CONFIG_URL)
  if (process.env.RUNTIME_CONFIG_URL) {
    return gulp.src(['./src/app/services/config/config.service.ts'])
      .pipe(replace('/public/config.json', process.env.RUNTIME_CONFIG_URL))
      .pipe(gulp.dest('./src/app/services/config/'))
  }
})

gulp.task('setSecretEnvVars', () => {
  return gulp.src('src/public/config.json', { base: './' })
    .pipe(replace('testPupilConnectionQueueUrlValue', process.env.TEST_PUPIL_CONNECTION_QUEUE_URL || ''))
    .pipe(replace('testPupilConnectionQueueTokenValue', process.env.TEST_PUPIL_CONNECTION_QUEUE_TOKEN || ''))
    .pipe(gulp.dest('./'))
})
