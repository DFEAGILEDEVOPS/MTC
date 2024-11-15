// manually built via guide at https://typescript-eslint.io/getting-started
// @ts-check
import globals from 'globals'
import eslint from '@eslint/js'
import tseslint from 'typescript-eslint'

export default tseslint.config({
  name: 'TS',
  files: ['**/*.ts'],
  extends: [
    eslint.configs.recommended,
    ...tseslint.configs.recommended
  ],
  rules: {
    '@typescript-eslint/no-require-imports': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/ban-ts-comment': 'off'
  }
},
// global ignores
// https://github.com/eslint/eslint/discussions/18304#discussioncomment-9069706
{
  ignores: ['**/*.min.js', 'dist/**', '**/vendor.js',
    'public/javascripts/app.js', 'coverage/**',
  'node_modules/**']
},
// TODO merge global items and remove duplicated
{
  name: 'JS',
  files: ['**/*.js'],
  extends: [
    eslint.configs.recommended
  ]
},
{
  rules: {
    'no-var': 'off'
  }
},
{
  languageOptions: {
    globals: {
      // TODO move these to narrowed scopes?
      GOVUK: 'readonly',
      ...globals.node,
      ...globals.jest,
      ...globals.browser,
      ...globals.jasmine,
      ...globals.jquery
    }
  }
})
