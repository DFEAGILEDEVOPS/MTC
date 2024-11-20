// manually built via guide at https://typescript-eslint.io/getting-started
// @ts-check
import globals from 'globals'
import eslint from '@eslint/js'
import tseslint from 'typescript-eslint'
import stylistic from '@stylistic/eslint-plugin'
import pluginJest from 'eslint-plugin-jest'

export default tseslint.config({
  name: 'TS-and-JS',
  files: ['**/*.ts', '**/*.js'],
  extends: [
    eslint.configs.recommended,
    ...tseslint.configs.recommended,
    stylistic.configs['recommended-flat']
  ],
  // TODO: why isnt this needed?
  languageOptions: {
    globals: {
      ...globals.node
    }
  },
  rules: {
    '@typescript-eslint/no-require-imports': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
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
  // update this to match your test files
  files: ['**/*.spec.js', '**/*.spec.ts'],
  plugins: { jest: pluginJest },
  languageOptions: {
    globals: pluginJest.environments.globals.globals,
  },
  rules: {
    'jest/no-disabled-tests': 'warn',
    'jest/no-focused-tests': 'error',
    'jest/no-identical-title': 'error',
    //'jest/prefer-to-have-length': 'warn',
    'jest/valid-expect': 'error',
  },
},
{
  name: 'Browser only',
  files: ['assets/**/*.js'],
  languageOptions: {
    globals: {
      GOVUK: 'readonly',
      ...globals.browser,
      ...globals.jquery
    }
  }
},
// global ignores
// https://github.com/eslint/eslint/discussions/18304#discussioncomment-9069706
{
  ignores: [
    '**/*.min.js',
    'dist/**',
    '**/vendor.js',
    'coverage/**',
    'node_modules/**',
    'public/**/*.*']
})
