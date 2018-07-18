// karma.conf.js
module.exports = function (config) {
  config.set({
    singleRun: true,
    autoWatch: false,
    files: [
      { pattern: 'public/javascripts/app.js', watched: false },
      'spec/javascripts/*.spec.js'
    ],
    frameworks: [
      'jasmine',
      'jquery-1.12.4'
    ],
    browsers: ['ChromeHeadless'],
    plugins: [
      'karma-jasmine',
      'karma-chrome-launcher',
      'karma-jquery'
    ]
  })
}
