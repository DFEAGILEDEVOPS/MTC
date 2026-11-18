'use strict'

const gulp = require('gulp')
const yarn = require('gulp-yarn')
const clean = require('gulp-clean')
const { execSync } = require('child_process')
const path = require('path')

gulp.task('clean', () => {
  return gulp.src(['./dist'], { read: false, allowEmpty: true })
    .pipe(clean())
})

gulp.task('compileTslib', (done) => {
  execSync('yarn build', { cwd: path.resolve(__dirname, '../tslib'), stdio: 'inherit' })
  done()
})

gulp.task('copyTslibDist', () => {
  return gulp.src(['../tslib/dist/**/*'], { encoding: false })
    .pipe(gulp.dest('./dist'))
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

gulp.task('copyEnvForDist', () => {
  return gulp
  .src(['../.env'], { allowEmpty: true })
  .pipe(gulp.dest('./'))
})

gulp.task('default', gulp.series('clean', 'yarnInstall', 'compileTslib', 'copyTslibDist', 'deleteSpecFiles', 'copyEnvForDist'))
