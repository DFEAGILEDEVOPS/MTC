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
    'plugin:jest/recommended',
    'plugin:jest/style'
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
        minimumDescriptionLength: 5
      }
    ],
    'jest/consistent-test-it': ['error',
    {
      'fn': 'test',
      'withinDescribe': 'test'
    }],
    'jest/no-conditional-expect': 'off',
    'jest/no-test-return-statement': 'error',
    'jest/prefer-spy-on': 'warn',
    'jest/prefer-strict-equal': 'warn',
    'jest/prefer-todo': 'error',
    'jest/require-to-throw-message': 'warn',
    'jest/require-top-level-describe': 'error'
  }
}
