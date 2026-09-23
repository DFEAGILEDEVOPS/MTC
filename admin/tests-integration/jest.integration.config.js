module.exports = {
  verbose: true,
  testMatch: ['./**/(*.)+(spec|test).[jt]s?(x)'],
  testRunner: 'jest-circus', // As of jest 27 this is the legacy mode (slow)
  setupFiles: ['./test-support/jest.setup.js'],
  moduleNameMapper: {
    axios: 'axios/dist/node/axios.cjs',
    '@opentelemetry/semantic-conventions/incubating': '@opentelemetry/semantic-conventions/build/src/index-incubating.js',
    '^@typespec/ts-http-runtime/internal/(.*)$': '@typespec/ts-http-runtime/dist/commonjs/$1/internal.js',
    '^@opentelemetry/otlp-exporter-base/(node-http|browser-http)$': '@opentelemetry/otlp-exporter-base/build/src/index-$1.js'
  }
}
