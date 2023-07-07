'use strict'

const gulp = require('gulp')
const ts = require('gulp-typescript')
const yarn = require('gulp-yarn')
const clean = require('gulp-clean')
const proj = ts.createProject('../tslib/tsconfig.json')
const path = require('path')
const watchDirectory = path.join(__dirname, '..', 'tslib', 'src', 'functions')

gulp.task('clean', () => {
  return gulp.src(['./dist'], { read: false, allowEmpty: true })
    .pipe(clean())
})

gulp.task('compileTslib', () => {
  return proj.src()
    .pipe(proj())
    .js.pipe(gulp.dest('./dist'))
})

gulp.task('yarnInstall', () => {
  return gulp.src(['../tslib/package.json', '../tslib/yarn.lock'])
    .pipe(gulp.dest('../tslib'))
    .pipe(yarn())
})

gulp.task('deleteSpecFiles', () => {
  return gulp.src(['./dist/**/**/*.spec.js'])
    .pipe(clean())
})

gulp.task('watch', () => {
  gulp.watch(`${watchDirectory}/**/**/*.ts`, gulp.series('compileTslib'))
})

gulp.task('default', gulp.series('clean', 'yarnInstall', 'compileTslib', 'deleteSpecFiles'))
