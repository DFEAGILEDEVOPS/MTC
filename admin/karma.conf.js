// karma.conf.js
module.exports = function (config) {
  config.set({
    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',
    frameworks: ['jasmine'],
    files: [
      { pattern: 'public/javascripts/vendor.js', watched: false, included: true },
      { pattern: 'public/javascripts/app.js', watched: false, included: true },
      'spec/front-end/*.spec.js'
    ],
    preprocessors: {
      'public/javascripts/app.js': ['coverage']
    },
    plugins: [
      'karma-jasmine',
      'karma-chrome-launcher',
      'karma-coverage'
    ],
    reporters: ['progress', 'coverage'],
    port: 9878,
    colors: true,
    logLevel: config.LOG_ERROR, // set to LOG_DEBUG for more
    autoWatch: false,
    singleRun: true,
    browsers: ['ChromeHeadless'],
    concurrency: Infinity,
    coverageReporter: {
      includeAllSources: true,
      dir: 'coverage/',
      reporters: [
        { type: 'html', subdir: 'frontend' },
        { type: 'text-summary' }
      ]
    }
  })
}
