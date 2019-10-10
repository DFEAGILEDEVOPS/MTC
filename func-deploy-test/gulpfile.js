'use strict'

const gulp = require('gulp')
const replace = require('gulp-replace')

gulp.task('align-function-script-targets', function (cb) {
  gulp.src(['**/function.json'])
    .pipe(replace('"scriptFile": "../../tslib', '"scriptFile": "..'))
    .pipe(gulp.dest('./'))
  cb()
})
