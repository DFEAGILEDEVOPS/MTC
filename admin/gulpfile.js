'use strict'

const gulp = require('gulp')
const babel = require('gulp-babel')
const sass = require('gulp-sass')(require('sass'))
const uglify = require('gulp-uglify')
const concat = require('gulp-concat')
const clean = require('gulp-clean')
const replace = require('gulp-replace')
const winston = require('winston')
const merge = require('merge-stream')
const path = require('path')
const fs = require('fs')
const globalDotEnvFile = path.join(__dirname, '..', '.env')
const dir = require('node-dir')
const md5 = require('md5')
const jedit = require('edit-json-file')
const ts = require('gulp-typescript')
const sourcemaps = require('gulp-sourcemaps')

try {
  if (fs.existsSync(globalDotEnvFile)) {
    console.log('globalDotEnvFile found', globalDotEnvFile)
    require('dotenv').config({ path: globalDotEnvFile })
  } else {
    console.log('No .env file found at project root')
  }
} catch (error) {
  console.error(error)
}

const config = require('./config')
const jsVendorBundleFiles = [
  './node_modules/govuk-frontend/govuk/all.js',
  './assets/vendor-js/jquery-3.7.1.min.js',
  './assets/vendor-js/gds-cookie-functions.js',
  './assets/vendor-js/gds-cookie-settings.js',
  './assets/vendor-js/gds-cookie-banner.js',
  './assets/vendor-js/accessible-autocomplete.min.js'
]

// These files will get uglified and packaged into `app.js`
const jsAppBundleFiles = [
  './assets/javascripts/gds-table-sorting.js',
  './assets/javascripts/gds-print-popup.js',
  './assets/javascripts/util-checkbox.js',
  './assets/javascripts/global-scripts.js',
  './assets/javascripts/jquery-modal.js',
  './assets/javascripts/custom-file-upload.js',
  './assets/javascripts/pupil-filter-name.js',
  './assets/javascripts/pupil-filter-group.js',
  './assets/javascripts/mtc-autocomplete.js',
  './assets/javascripts/mtc-check-forms.js',
  './assets/javascripts/print-popup.js',
  './assets/javascripts/step-by-step-navigation.js',
  './assets/javascripts/session-expiry.js', // here be dragons
  './assets/javascripts/pupil-access-arrangements-selection.js',
  './assets/javascripts/pupil-retro-input-assistant.js',
  './assets/javascripts/pupil-form.js',
  './assets/javascripts/pupil-status-selection.js'
]

// These files are used in the service manager markdown editor, and font-awesome is the dependency.
const simpleMdeFiles = [
  './node_modules/simplemde/dist/simplemde.min.js',
  './node_modules/simplemde/dist/simplemde.min.css'
]
const fontAwesomeFiles = {
  css: ['./node_modules/font-awesome/css/font-awesome.min.css'],
  fontDir: './node_modules/font-awesome/fonts/**/*'
}

/*
  session-expiry.js contains two strings that are claimed to be global variables.  The `bundlejs` task will replace
  these strings with values from config during the build.  If config has not loaded correctly the input to `uglify` will
  be incorrect and `uglify` will bomb-out with this message `{"message":"Unexpected token: punc «,»"}`
 */

const proj = ts.createProject('./tsconfig.json')

function cleanDist () {
  return gulp.src(['./dist'], { read: false, allowEmpty: true })
    .pipe(clean())
}

function compileTs () {
  return proj.src()
    .pipe(proj())
    .js.pipe(gulp.dest('./dist'))
}

function compileTsWithSourceMaps () {
  return proj.src()
    .pipe(sourcemaps.init()) // This means sourcemaps will be generated
    .pipe(proj()).js
    .pipe(sourcemaps.write()) // Now the sourcemaps are added to the .js file
    .pipe(gulp.dest('./dist'))
}

function copyPublicFilesToDist () {
  return gulp
    .src(['./public/**/*'])
    .pipe(gulp.dest('./dist/public'))
}

function copyViewFilesToDist () {
  return gulp
    .src(['./views/**/*'])
    .pipe(gulp.dest('./dist/views'))
}

function copyEnvForDist () {
  return gulp
    .src(['../.env'], { allowEmpty: true })
    .pipe(gulp.dest('./'))
}

function copyPackageJsonToDist () {
  return gulp
    .src(['./package.json'])
    .pipe(gulp.dest('./dist'))
}

function compileCss () {
  return gulp.src('./assets/**/*.scss')
    .pipe(replace('/vendor/govuk-frontend/', `${config.AssetPath}vendor/govuk-frontend/`))
    .pipe(sass({ outputStyle: 'compressed' }).on('error', sass.logError))
    .pipe(gulp.dest('./public'))
}

function watch () {
  gulp.watch('./assets/**/*.scss', gulp.series(compileCss, copyPublicFilesToDist))
  gulp.watch('./assets/**/*.js', gulp.series(bundleAppJsForCodeCoverage, copyPublicFilesToDist))
  gulp.watch('./views/**/*.ejs', gulp.series(copyViewFilesToDist))
  gulp.watch(['./**/*.[t|j]s', '!./dist/**/*'], gulp.series(compileTsWithSourceMaps))
}

function bundleVendorJs () {
  return gulp.src(jsVendorBundleFiles)
    .pipe(concat('vendor.js'))
    .pipe(babel({
      presets: ['@babel/preset-env'],
      sourceType: 'unambiguous'
    }))
    .pipe(uglify({
      ie8: true
    }).on('error', function (e) {
      winston.error(e)
    }))
    .pipe(gulp.dest('./public/javascripts/'))
}

function bundleAppVendorJs () {
  return gulp.src(jsAppBundleFiles)
    .pipe(concat('app.js'))
    .pipe(replace('SESSION_DISPLAY_NOTICE_TIME', config.ADMIN_SESSION_DISPLAY_NOTICE_AFTER.toString()))
    .pipe(babel({
      presets: ['@babel/preset-env'],
      sourceType: 'unambiguous'
    }))
    .pipe(uglify({
      ie8: true
    }).on('error', function (e) {
      winston.error(e)
    }))
    .pipe(gulp.dest('./public/javascripts/'))
}

function bundleAppJsForCodeCoverage () {
  return gulp.src(jsAppBundleFiles)
    .pipe(sourcemaps.init())
    .pipe(concat('app.js'))
    .pipe(replace('SESSION_DISPLAY_NOTICE_TIME', config.ADMIN_SESSION_DISPLAY_NOTICE_AFTER.toString()))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('./public/javascripts/'))
}

function bundleFuncCallsJs () {
  const viewJS = [
    'cookie-form.js',
    'google-analytics.js',
    'layout.js',
    'pupil-register.js',
    'pupil-status.js',
    'pupil-pin.js'
  ]
  const tasks = viewJS.map(v => {
    return gulp.src([`./assets/javascripts/${v}`])
      .pipe(concat(v))
      .pipe(babel({
        presets: ['@babel/preset-env'],
        sourceType: 'unambiguous'
      }))
      .pipe(uglify({
        ie8: true
      }).on('error', function (e) {
        winston.error(e)
      }))
      .pipe(gulp.dest('./public/javascripts/'))
  })
  return merge(tasks)
}

function cleanPublic () {
  return gulp.src([
    'public/javascripts/app.js',
    'public/stylesheets/application.css',
    'public/stylesheets/application-ie8.css',
    'public/vendor/'
  ], { read: false, allowEmpty: true, force: true })
    .pipe(clean())
}

function copyImages () {
  return gulp
    .src(['./assets/images/*'])
    .pipe(gulp.dest('public/images'))
}

function copyGdsImages () {
  return gulp
    .src(['./node_modules/govuk-frontend/govuk/assets/images/*'])
    .pipe(gulp.dest('public/vendor/govuk-frontend/images'))
}

function copyGdsFonts () {
  return gulp
    .src(['./node_modules/govuk-frontend/govuk/assets/fonts/*'])
    .pipe(gulp.dest('public/vendor/govuk-frontend/fonts'))
}

function copyPdfs () {
  return gulp
    .src(['./assets/pdfs/*'])
    .pipe(gulp.dest('public/pdfs'))
}

function copyCsvFiles () {
  return gulp
    .src(['./assets/csv/*'])
    .pipe(gulp.dest('public/csv'))
}
function copySimpleMdeFiles () {
  return gulp
    .src(simpleMdeFiles)
    .pipe(gulp.dest('public/vendor/simplemde'))
}
function copyFontAwesomeCss () {
  return gulp
    .src(fontAwesomeFiles.css)
    .pipe(gulp.dest('public/vendor/font-awesome/css'))
}
function copyFontAwesomeFonts () {
  return gulp
    .src(fontAwesomeFiles.fontDir, { base: './node_modules/font-awesome/' })
    .pipe(gulp.dest('public/vendor/font-awesome'))
}

function generateAssetsVersion (done) {
  let assetsContent = ''
  dir.readFiles('./public/', {
    // match only filenames with a .js and .css extensions and that don't start with a `.´
    match: /^[^.].+\.(js|css)$/i
  }, function (err, content, next) {
    if (err) throw err
    assetsContent = assetsContent.concat(content)
    next()
  },
  function (err) {
    if (err) throw err
    const md5hash = md5(assetsContent)
    const dest = jedit('./package.json')
    dest.set('mtc.assets-version', md5hash)
    dest.save()
  })
  done()
}

gulp.task('build',
  gulp.series(
    gulp.parallel(cleanDist, cleanPublic),
    gulp.parallel(
      compileTs,
      compileCss,
      bundleVendorJs,
      bundleAppVendorJs,
      bundleFuncCallsJs,
      copyImages,
      copyGdsImages,
      copyGdsFonts,
      copyPdfs,
      copyCsvFiles,
      copySimpleMdeFiles,
      copyFontAwesomeCss,
      copyFontAwesomeFonts
    ),
    generateAssetsVersion,
    gulp.parallel(
      copyPublicFilesToDist,
      copyViewFilesToDist,
      copyEnvForDist,
      copyPackageJsonToDist
    )
  )
)

gulp.task('dev-build',
  gulp.series(
    gulp.parallel(cleanDist, cleanPublic),
    gulp.parallel(
      compileTsWithSourceMaps,
      compileCss,
      bundleVendorJs,
      bundleAppJsForCodeCoverage,
      bundleFuncCallsJs,
      copyImages,
      copyGdsImages,
      copyGdsFonts,
      copyPdfs,
      copyCsvFiles,
      copySimpleMdeFiles,
      copyFontAwesomeCss,
      copyFontAwesomeFonts
    ),
    generateAssetsVersion,
    gulp.parallel(
      copyPublicFilesToDist,
      copyViewFilesToDist,
      copyEnvForDist,
      copyPackageJsonToDist
    )
  )
)

exports.cleanDist = cleanDist
exports.compileTs = compileTs
exports.watch = watch
exports.bundleAppJsForCodeCoverage = bundleAppJsForCodeCoverage
exports.cleanPublic = cleanPublic
