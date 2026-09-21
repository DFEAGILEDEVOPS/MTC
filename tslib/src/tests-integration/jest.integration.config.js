export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^uuid$': '<rootDir>/../tests-support/uuid.mock.ts',
    '^(\\.{1,2}/.*)\\.js$': '$1'
  }
}
