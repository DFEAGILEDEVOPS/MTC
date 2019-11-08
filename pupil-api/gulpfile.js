const gulp = require('gulp')
const JSON_FILES = ['src/*.json', 'src/**/*.json']

gulp.task('watch', () => {
  gulp.watch('src/**/*.ts', gulp.series('scripts'))
})

gulp.task('json', function () {
  return gulp.src(JSON_FILES)
    .pipe(gulp.dest('dist'))
})

gulp.task('default', gulp.parallel('watch', 'json'))
