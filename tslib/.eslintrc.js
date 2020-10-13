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
  // eslint full: 693 errors, 4 warnings
  // standard: 1617 errors, 4 warnings
  extends: [
    'standard-with-typescript',
    // 'eslint:recommended',
    // 'plugin:@typescript-eslint/recommended',
    // 'plugin:@typescript-eslint/recommended-requiring-type-checking'
  ],
  rules: {
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/method-signature-style': 'off',
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
    "jest/valid-expect": "error"
  }
}
