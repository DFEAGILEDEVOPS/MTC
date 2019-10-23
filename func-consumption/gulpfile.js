'use strict'

const { series, src, dest } = require('gulp')
const ts = require('gulp-typescript')
const yarn = require('gulp-yarn')
const rimraf = require('rimraf')

function clean (cb) {
  rimraf('./gulpdist', (error) => {
    if (error) {
      throw error
    }
    console.log('deleted gulpdist')
    rimraf('./yarndist', (error) => {
      if (error) {
        throw error
      }
      console.log('deleted yarndist')
      cb()
    })
  })
}

function compileTslib (cb) {
  const proj = ts.createProject('../tslib/tsconfig.json')
  proj.src()
    .pipe(proj())
    .js.pipe(dest('./gulpdist'))
  cb()
}

function yarnInstall (cb) {
  src(['../tslib/package.json', '../tslib/yarn.lock'])
    .pipe(dest('../tslib'))
    .pipe(yarn())
  cb()
}

exports.default = series(clean, yarnInstall, compileTslib)
