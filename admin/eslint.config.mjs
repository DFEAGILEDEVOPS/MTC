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
{
  name: 'JS',
  files: ['**/*.js'],
  ignores: ['**/*.min.js', 'dist/**/*.js', '**/vendor.js',
    'public/javascripts/app.js', 'coverage/frontend/html/prettify.js'],
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
