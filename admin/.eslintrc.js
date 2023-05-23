module.exports = {
  root: true,
  env: {
    node: true,
    jest: true
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: './tsconfig.json',
    warnOnUnsupportedTypeScriptVersion: true
  },
  plugins: [
    '@typescript-eslint',
    'jest'
  ],
  extends: [
    'standard-with-typescript',
    'plugin:jest/recommended',
    'plugin:jest/style'
  ],
  ignorePatterns: [
    'dist/',
    'public/',
    '**/*.js'
  ],
  rules: {
    'no-return-await': 'off',
    '@typescript-eslint/no-extraneous-class': 'off',
    '@typescript-eslint/return-await': ['error', 'in-try-catch'],
    '@typescript-eslint/prefer-ts-expect-error': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-var-requires': 'off',
    '@typescript-eslint/method-signature-style': 'off',
    '@typescript-eslint/restrict-template-expressions': 'off',
    // causes a problem with require statements when enabled...
    '@typescript-eslint/strict-boolean-expressions': 'off',
    // disabled until we can turn strictNullChecks on, as this allows undefined/nulls to slip through as boolean checks...
    '@typescript-eslint/no-unnecessary-boolean-literal-compare': 'off',
    '@typescript-eslint/consistent-type-imports': 'off',
    '@typescript-eslint/ban-ts-comment': [
      'warn',
      {
        'ts-expect-error': true,
        'ts-ignore': 'allow-with-description',
        'ts-nocheck': true,
        'ts-check': false,
        minimumDescriptionLength: 5
      },
    ],
    'jest/consistent-test-it': ['error',
    {
      'fn': 'test',
      'withinDescribe': 'test'
    }],
    'jest/no-conditional-expect': 'off',
    'jest/no-jasmine-globals': 'off', // must be addressed soon, as Jasmine API is due to be phased out from Jest internals.
    'jest/no-restricted-matchers': [
      'error',
      {
        'toBeFalsy': 'Ambiguous expectation. Use `toBe(false)` for boolean and `toBeDefined()` for instance verification.',
        'toBeTruthy': 'Ambiguous expectation. Use `toBe(true)` for boolean and `toBeDefined()` for instance verification.',
        'not.toHaveBeenCalledWith': 'narrow expectation by using `toHaveBeenCalledWith`'
      }
    ],
    'jest/no-test-return-statement': 'error',
    'jest/no-try-expect': 'off', // a lot of code to change due to usage of fail.  removing use of fail ties in with [no-jasmine-globals] rule, as its jasmine API
    'jest/prefer-called-with': 'warn',
    'jest/prefer-spy-on': 'warn',
    'jest/prefer-strict-equal': 'error',
    'jest/prefer-todo': 'error',
    'jest/require-to-throw-message': 'warn',
    'jest/require-top-level-describe': 'error'
  }
}
