module.exports = {
  verbose: true,
  testMatch: ['./**/(*.)+(spec|test).[jt]s?(x)'],
  testRunner: 'jest-circus', // As of jest 27 this is the legacy mode (slow)
  moduleNameMapper: {
    axios: 'axios/dist/node/axios.cjs'
  }
}
