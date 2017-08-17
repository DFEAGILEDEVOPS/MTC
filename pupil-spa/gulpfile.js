const gulp = require('gulp')
const replace = require('gulp-string-replace')

gulp.task('setAppEnvironmentVariables', () => {
  if (process.env.API_URL) {
    gulp.src(['./src/environments/environment.prod.ts'])
      .pipe(replace('API_URL', process.env.API_URL))
      .pipe(gulp.dest('./src/environments/'))
  }
})
