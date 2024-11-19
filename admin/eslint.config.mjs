// manually built via guide at https://typescript-eslint.io/getting-started
// @ts-check
import globals from 'globals'
import eslint from '@eslint/js'
import tseslint from 'typescript-eslint'
import stylistic from '@stylistic/eslint-plugin'

export default tseslint.config({
  name: 'TS-and-JS',
  files: ['**/*.ts', '**/*.js'],
  extends: [
    eslint.configs.recommended,
    ...tseslint.configs.recommended,
    stylistic.configs['recommended-flat']
  ],
  languageOptions: {
    globals: {
      ...globals.node
    }
  },
  rules: {
    '@typescript-eslint/no-require-imports': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/ban-ts-comment': 'off',
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
  name: 'Tests only',
  files: ['**/*.spec.ts', '**/*.spec.js'],
  languageOptions: {
    globals: {
      ...globals.jest,
      ...globals.jasmine
    }
  }
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
