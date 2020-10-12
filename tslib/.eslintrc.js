module.exports = {
  root: true,
  env: {
    node: true
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: ['./tsconfig.json'],
    warnOnUnsupportedTypeScriptVersion: true
  },
  plugins: [
    '@typescript-eslint'
  ],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    // 'plugin:@typescript-eslint/recommended-requiring-type-checking'
  ],
  rules: {
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/ban-ts-comment': [
      'warn',
      {
        'ts-expect-error': true,
        'ts-ignore': 'allow-with-description',
        'ts-nocheck': true,
        'ts-check': false,
        minimumDescriptionLength: 5,
      },
    ]
  }
}
