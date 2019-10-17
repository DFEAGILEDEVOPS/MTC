const gulp = require('gulp')
const ts = require('gulp-typescript')
const JSON_FILES = ['src/*.json', 'src/**/*.json']

// pull in the project TypeScript config
const tsProject = ts.createProject('tsconfig.json')

gulp.task('scripts', () => {
  const tsResult = tsProject.src()
    .pipe(tsProject())
  return tsResult.js.pipe(gulp.dest('dist'))
})

gulp.task('watch', () => {
  gulp.watch('src/**/*.ts', gulp.series('scripts'))
})

gulp.task('assets', function () {
  return gulp.src(JSON_FILES)
    .pipe(gulp.dest('dist'))
})

gulp.task('default', gulp.parallel('watch', 'assets'))
