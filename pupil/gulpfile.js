'use strict';

var gulp = require('gulp');
var path = require('path');
var zip = require('gulp-zip');
var minimist = require('minimist');
var fs = require('fs');
var sass = require('gulp-sass');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var download = require("gulp-download");
var clean = require('gulp-clean');
var fs = require('fs');
var path = require('path');
var array = require('lodash/array');
var gutil = require('gulp-util');

var knownOptions = {
  string: 'packageName',
  string: 'packagePath',
  default: {packageName: "Package.zip", packagePath: path.join(__dirname, '_package')}
};

var options = minimist(process.argv.slice(2), knownOptions);

// These files get downloaded into the public folder
var files = [
  'https://mtcalphafiles.blob.core.windows.net/downloadfiles/128kb.text',
  'https://mtcalphafiles.blob.core.windows.net/downloadfiles/256kb.text',
  'https://mtcalphafiles.blob.core.windows.net/downloadfiles/512kb.text',
  'https://mtcalphafiles.blob.core.windows.net/downloadfiles/1mb.text',
  'https://mtcalphafiles.blob.core.windows.net/downloadfiles/2mb.text',
  'https://mtcalphafiles.blob.core.windows.net/downloadfiles/4mb.text',
  'https://mtcalphafiles.blob.core.windows.net/downloadfiles/8mb.text',
  'https://mtcalphafiles.blob.core.windows.net/downloadfiles/16mb.text',
  'https://mtcalphafiles.blob.core.windows.net/downloadfiles/32mb.text',
  'https://mtcalphafiles.blob.core.windows.net/downloadfiles/64mb.text',
  'https://mtcalphafiles.blob.core.windows.net/downloadfiles/128mb.text'
];

// These files will get uglified and packaged into `app.js`
var jsBundleFiles = [
  './assets/javascripts/jquery-1.12.4.js',
  './assets/javascripts/modernizr-custom.js',
  './assets/javascripts/details.polyfill.js'
];

gulp.task('sass', function () {
  return gulp.src('./assets/**/*.scss')
    .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
    .pipe(gulp.dest('./public'));
});

gulp.task('watch', function () {
  gulp.watch('./assets/**/*.scss', ['sass']);
  gulp.watch('./assets/**/*.js', ['bundleJs']);
});

gulp.task('bundleJs', function () {
  return gulp.src(jsBundleFiles)
    .pipe(concat('app.js'))
    .pipe(uglify({
      compress: { screw_ie8: false },
      mangle: { screw_ie8: false },
      output: { screw_ie8: false }
    }).on('error', function(e){
      console.log(e);
    }))
    .pipe(gulp.dest('./public/javascripts/'));
});

gulp.task('provideSpeedTestFiles', function () {

  let dir = './public/data/';
  let wantedFiles = files.map(function (el) {
    return path.posix.basename(el);
  });

  fs.readdir(dir, function (err, dirFiles) {
    if (err) {
      gutil.log(gutil.colors.red("Error"), "Unable to read", dir);
      gutil.log(gutil.colors.red(err));
      return;
    }
    if (array.difference(wantedFiles, dirFiles).length === 0) {
      gutil.log(gutil.colors.cyan("'provideSpeedTestFiles'"), "Nothing to do");
    } else {
      gutil.log("Need to re-download the files");
      return download(files)
        .pipe(gulp.dest('./public/data/'));
    }
  });
});

gulp.task('clean', function () {
  return gulp.src([
    'public/javascripts/app.js',
    'public/data/*.text',
    'public/stylesheets/application.css',
    'public/stylesheets/application-ie8.css'
  ], {read: false})
    .pipe(clean());
});

gulp.task('realclean', ['clean'], function (){
  return gulp.src('./node_modules', {read: false})
    .pipe(clean());
});

gulp.task('build', ['sass', 'bundleJs']);

gulp.task('dist', ['build'], function () {

  var packagePaths = ['**',
    '!**/_package/**',
    '!**/typings/**',
    '!typings',
    '!_package',
    '!gulpfile.js']

  //add exclusion patterns for all dev dependencies
  var packageJSON = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8'));
  var devDeps = packageJSON.devDependencies;

  for (var propName in devDeps) {
    var excludePattern1 = "!**/node_modules/" + propName + "/**";
    var excludePattern2 = "!**/node_modules/" + propName;
    packagePaths.push(excludePattern1);
    packagePaths.push(excludePattern2);
  }

  return gulp.src(packagePaths)
    .pipe(zip(options.packageName))
    .pipe(gulp.dest(options.packagePath));
});
