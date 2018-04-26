const gulp = require('gulp')
const replace = require('gulp-string-replace')

gulp.task('setApiURL', () => {
  console.log('Attempting to update angular config from environment variables...')
  console.log('env.API_URL is:', process.env.API_URL)
  if (process.env.API_URL) {
    gulp.src(['./src/environments/environment.prod.ts'])
      .pipe(replace('API_URL', process.env.API_URL))
      .pipe(gulp.dest('./src/environments/'))
  }
})

gulp.task('setCheckSubmissionURL', () => {
  console.log('Attempting to update angular config from environment variables...')
  console.log('env.CHECK_SUBMISSION_URL is:', process.env.CHECK_SUBMISSION_URL)
  if (process.env.CHECK_SUBMISSION_URL) {
    gulp.src(['./src/environments/environment.prod.ts'])
      .pipe(replace('CHECK_SUBMISSION_URL', process.env.CHECK_SUBMISSION_URL))
      .pipe(gulp.dest('./src/environments/'))
  }
})

gulp.task('setGaCode', () => {
  console.log('env.GA_CODE is:', process.env.GA_CODE)
  gulp.src(['./src/environments/environment.prod.ts'])
    .pipe(replace('GA_CODE', process.env.GA_CODE || ''))
    .pipe(gulp.dest('./src/environments/'))
})
