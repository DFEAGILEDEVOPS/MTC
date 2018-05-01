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

<<<<<<< HEAD
gulp.task('setCheckStartedURL', () => {
  console.log('Attempting to update angular config from environment variables...')
  console.log('env.CHECK_STARTED_URL is:', process.env.CHECK_STARTED_URL)
  if (process.env.CHECK_STARTED_URL) {
    gulp.src(['./src/environments/environment.prod.ts'])
      .pipe(replace('CHECK_STARTED_URL', process.env.CHECK_STARTED_URL))
=======
gulp.task('setAuthURL', () => {
  console.log('Attempting to update angular config from environment variables...')
  console.log('env.AUTH_URL is:', process.env.AUTH_URL)
  if (process.env.AUTH_URL) {
    gulp.src(['./src/environments/environment.prod.ts'])
      .pipe(replace('AUTH_URL', process.env.AUTH_URL))
>>>>>>> master
      .pipe(gulp.dest('./src/environments/'))
  }
})

gulp.task('setGaCode', () => {
  console.log('env.GA_CODE is:', process.env.GA_CODE)
  gulp.src(['./src/environments/environment.prod.ts'])
    .pipe(replace('GA_CODE', process.env.GA_CODE || ''))
    .pipe(gulp.dest('./src/environments/'))
})
