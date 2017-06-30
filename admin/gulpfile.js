'use strict'

const gulp = require('gulp')
const path = require('path')
const fs = require('fs')
const sass = require('gulp-sass')
const uglify = require('gulp-uglify')
const concat = require('gulp-concat')
const clean = require('gulp-clean')
const standard = require('gulp-standard')

// These files will get uglified and packaged into `app.js`
const jsBundleFiles = [
  './assets/javascripts/jquery-1.12.4.js',
  './assets/javascripts/details.polyfill.js',
  './assets/javascripts/global-scripts.js'
]

const jsFilesForStandard = [
  '!node_modules/**/*',
  '!assets/javascripts/details.polyfill.js',
  '!assets/javascripts/jquery-1.12.4.js',
  '!public/govuk_template/javascripts/ie.js',
  '!public/govuk_template/javascripts/govuk-template.js',
  '!public/javascripts/app.js',
  './**/*.js'
]

gulp.task('watch', function () {
  gulp.watch('./assets/**/*.scss', ['sass'])
  gulp.watch('./assets/**/*.js', ['bundleJs'])
})

gulp.task('bundleJs', function () {
  return gulp.src(jsBundleFiles)
    .pipe(concat('app.js'))
    .pipe(uglify({
      compress: { screw_ie8: false },
      mangle: { screw_ie8: false },
      output: { screw_ie8: false }
    }).on('error', function (e) {
      console.log(e)
    }))
    .pipe(gulp.dest('./public/javascripts/'))
})

gulp.task('clean', function () {
  return gulp.src([
    'public/javascripts/app.js',
    'public/stylesheets/application.css',
    'public/stylesheets/application-ie8.css'
  ], {read: false})
    .pipe(clean())
})

gulp.task('copyImages', function () {
  gulp
    .src(['./assets/images/*'])
    .pipe(gulp.dest('public/images'))
})

gulp.task('copyPDFs', function () {
  gulp
  .src(['./assets/PDFs/*'])
  .pipe(gulp.dest('public/PDFs'))
})

gulp.task('standard', function () {
  return gulp.src(jsFilesForStandard)
    .pipe(standard())
    .pipe(standard.reporter('default', {
      breakOnError: true,
      quiet: true
    }))
})

gulp.task('realclean', ['clean'], function () {
  return gulp.src('./node_modules', {read: false})
    .pipe(clean())
})

gulp.task('build', ['sass', 'bundleJs', 'copyImages', 'copyPDFs'])

gulp.task('sass', function () {
  return gulp.src('./assets/**/*.scss')
    .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
    .pipe(gulp.dest('./public'))
})
