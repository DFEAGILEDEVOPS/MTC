module.exports = function (w) {
  return {
    files: [
      'controllers/**/*.js',
      'services/**/*.js',
      'lib/**/*.js',
      'models/**/*.js',
      'spec/mocks/*.js',
      'config.js',
      'utils.js',
      'data/fixtures/*.csv'
    ],

    tests: [
      'spec/**/*.spec.js'
    ],
    env: {
      type: 'node',
      kind: 'chrome'
    },
    testFramework: 'jasmine'
  }
}
