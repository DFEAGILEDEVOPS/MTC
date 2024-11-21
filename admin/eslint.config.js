// manually built via guide at https://typescript-eslint.io/getting-started
// @ts-check
const globals = require('globals')
const eslint = require('@eslint/js')
const tseslint = require('typescript-eslint')
const stylistic = require('@stylistic/eslint-plugin')
const pluginJest = require('eslint-plugin-jest')

module.exports = tseslint.config({
  name: 'TS-and-JS',
  // files: ['**/*.ts', '**/*.js'],
  extends: [
    eslint.configs.recommended,
    ...tseslint.configs.stylisticTypeChecked,
    stylistic.configs['recommended-flat']
  ],
  // TODO: why isnt this needed?
  languageOptions: {
    globals: {
      ...globals.node
    },
    parserOptions: {
      tsconfigRootDir: __dirname,
      projectService: true,
      warnOnUnsupportedTypeScriptVersion: true
    },
  },
  rules: {
    // new rules...
    '@typescript-eslint/no-require-imports': 'off',
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': 'error',
    // migrated rules...
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
    '@stylistic/comma-dangle': 'off',
    '@stylistic/space-before-function-paren': 'off',
    '@stylistic/max-statements-per-line': ['error', { max: 2 }],
    '@stylistic/brace-style': ['error', '1tbs', { allowSingleLine: true }],
    '@stylistic/arrow-parens': 'off',
    '@stylistic/quote-props': 'off',
    '@stylistic/operator-linebreak': ['error', 'after'],
    '@stylistic/no-multiple-empty-lines': ['error', { maxBOF: 1, max: 1, maxEOF: 0 }],
  }
},
{
  files: ['**/*.js'],
  extends: [tseslint.configs.disableTypeChecked],
},
{
  // update this to match your test files
  files: ['**/*.spec.js', '**/*.spec.ts'],
  plugins: { jest: pluginJest },
  languageOptions: {
    globals: {
      // ...pluginJest.environments.globals.globals,
      ...globals.jest,
      ...globals.jasmine
    },
  },
  rules: {
    '@typescript-eslint/no-empty-function': 'off',
    // TODO migrate existing jest rules
    'jest/no-disabled-tests': 'warn',
    'jest/no-focused-tests': 'error',
    'jest/no-identical-title': 'error',
    // TODO enable 'jest/prefer-to-have-length': 'warn',
    'jest/valid-expect': 'error',
  },
},
{
  name: 'Browser only',
  files: ['assets/**/*.js', 'spec/front-end/**/*.js'],
  languageOptions: {
    globals: {
      GOVUK: 'readonly',
      ...globals.browser,
      ...globals.jquery
    }
  },
  rules: {
    '@typescript-eslint/prefer-for-of': 'off'
  }
},
// global ignores
// https://github.com/eslint/eslint/discussions/18304#discussioncomment-9069706
{
  ignores: [
    '**/*.min.js',
    'dist/',
    '**/vendor.js',
    'coverage/**',
    'node_modules/**',
    'public/']
})
