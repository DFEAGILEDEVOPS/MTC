'use strict'

const gulp = require('gulp')
const sass = require('gulp-sass')
const uglify = require('gulp-uglify')
const concat = require('gulp-concat')
const clean = require('gulp-clean')
const winston = require('winston')
const sassVariables = require('gulp-sass-variables')
const config = require('./config')
const replace = require('gulp-replace')
require('dotenv').config()

// These files will get uglified and packaged into `app.js`
const jsBundleFiles = [
  './assets/javascripts/jquery-1.12.4.js',
  './assets/javascripts/details.polyfill.js',
  './assets/javascripts/global-scripts.js',
  './assets/javascripts/jquery-modal.js',
  './assets/javascripts/custom-file-upload.js'
]

gulp.task('watch', function () {
  gulp.watch('./assets/**/*.scss', ['sass'])
  gulp.watch('./assets/**/*.js', ['bundleJs'])
})

gulp.task('bundleJs', function () {
  return gulp.src(jsBundleFiles)
    .pipe(concat('app.js'))
    .pipe(uglify({
      ie8: true
    }).on('error', function (e) {
      winston.error(e)
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

gulp.task('copyCsvFiles', function () {
  gulp
    .src(['./assets/CSVs/*'])
    .pipe(gulp.dest('public/CSVs'))
})

gulp.task('realclean', ['clean'], function () {
  return gulp.src('./node_modules', {read: false})
    .pipe(clean())
})

gulp.task('build', ['sass', 'bundleJs', 'copyImages', 'copyPDFs', 'copyCsvFiles'])

gulp.task('sass', function () {
  return gulp.src('./assets/**/*.scss')
    .pipe(sassVariables({
      $assetPath: config.AssetPath
    }))
    .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
    .pipe(gulp.dest('./public'))
})
