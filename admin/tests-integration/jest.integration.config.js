module.exports = {
  verbose: true,
  testMatch: ['./**/(*.)+(spec|test).[jt]s?(x)'],
  testRunner: 'jest-jasmine2' // As of jest 27 this is the legacy mode (slow)
}
