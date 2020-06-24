// karma.conf.js
module.exports = function (config) {
  config.set({
    singleRun: true,
    autoWatch: false,
    files: [
      { pattern: 'public/javascripts/app.js', watched: false },
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
