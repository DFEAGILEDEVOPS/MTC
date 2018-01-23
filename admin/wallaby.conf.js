/*
  This file configures the wallaby.js interactive test runner - https://wallabyjs.com/
  Docs: https://wallabyjs.com/docs/config/overview.html
*/

module.exports = function (w) {
  return {
    files: [
      'controllers/**/*.js',
      'services/**/*.js',
      'lib/**/*.js',
      { pattern: 'models/**/*.js', instrument: false, load: true, ignore: false },
      { pattern: 'spec/mocks/*.js', instrument: false, load: true, ignore: false },
      { pattern: 'data/fixtures/*.csv', instrument: false, load: true, ignore: false },
      'config.js',
      'utils.js'
    ],
    tests: [
      'spec/**/*.spec.js'
    ],
    env: {
      type: 'node',
      kind: 'chrome'
    },
    testFramework: 'jasmine',
    workers: {recycle: true}
  }
}
