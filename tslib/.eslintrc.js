module.exports = {
  root: true,
  env: {
    node: true
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
  ],
  rules: {
    'no-return-await': 'off',
    '@typescript-eslint/return-await': ['error', 'in-try-catch'],
    '@typescript-eslint/prefer-ts-expect-error': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/method-signature-style': 'off',
    '@typescript-eslint/restrict-template-expressions': 'off',
    '@typescript-eslint/ban-ts-comment': [
      'warn',
      {
        'ts-expect-error': true,
        'ts-ignore': 'allow-with-description',
        'ts-nocheck': true,
        'ts-check': false,
        minimumDescriptionLength: 5,
      },
    ],
    "jest/no-disabled-tests": "warn",
    "jest/no-focused-tests": "error",
    "jest/no-identical-title": "error",
    "jest/prefer-to-have-length": "warn",
    "jest/valid-expect": "error",
    "jest/expect-expect": "error",
    "jest/no-alias-methods": "error",
    "jest/no-commented-out-tests": "error",
    // "jest/no-jasmine-globals": "error", (disallows use of fail, unfortunately)
    "jest/no-jest-import": "error",
    "jest/no-mocks-import": "error",
    "jest/no-restricted-matchers": [
      "error",
      {
        "toBeFalsy": "Ambiguous expectation. Use `toBe(false)` for boolean and `toBeDefined()` for instance verification.",
        "toBeTruthy": "Ambiguous expectation. Use `toBe(true)` for boolean and `toBeDefined()` for instance verification.",
        "resolves": "Use `expect(await promise)` instead.",
        "not.toHaveBeenCalledWith": null
      }
    ]
  }
}
