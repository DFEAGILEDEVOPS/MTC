'use strict'

const { series, src, dest } = require('gulp')
const ts = require('gulp-typescript')
const yarn = require('gulp-yarn')
const rimraf = require('rimraf')

function clean (cb) {
  rimraf('./dist', (error) => {
    if (error) {
      console.error(error)
    }
    cb(error)
  })
}

function compileTslib (cb) {
  const proj = ts.createProject('../tslib/tsconfig.json')
  proj.src()
    .pipe(proj())
    .js.pipe(dest('./dist'))
  cb()
}

function yarnInstall (cb) {
  src(['../tslib/package.json', '../tslib/yarn.lock'])
    .pipe(dest('../tslib'))
    .pipe(yarn())
  cb()
}

exports.default = series(clean, yarnInstall, compileTslib)
