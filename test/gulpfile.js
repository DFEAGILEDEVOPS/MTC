'use strict'

const gulp = require('gulp')
const protractor = require('gulp-protractor').protractor

gulp.task('protractor', function () {
  gulp.src(['./features/*.feature']).pipe(protractor({
    configFile: './conf.js',
    args: ['--baseUrl', 'http://localhost:3001']
  }))
        .on('error', function (e) {
          throw e
        })
})
