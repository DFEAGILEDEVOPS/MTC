// karma.conf.js
module.exports = function (config) {
  config.set({
    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',
    reporters: ['progress'],
    singleRun: true,
    autoWatch: false,
    files: [
      { pattern: 'public/javascripts/app.js', watched: false, included: true },
      'spec/front-end/*.spec.js'
    ],
    frameworks: ['jasmine'],
    browsers: ['ChromeHeadless'],
    plugins: [
      'karma-jasmine',
      'karma-chrome-launcher'
    ]
  })
}
