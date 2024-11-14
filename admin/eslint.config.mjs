// manually built via guide at https://typescript-eslint.io/getting-started
// @ts-check
import globals from 'globals'
import eslint from '@eslint/js'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      'no-return-await': 'off',
      '@typescript-eslint/no-extraneous-class': 'off',
      '@typescript-eslint/return-await': ['error', 'in-try-catch'],
      '@typescript-eslint/prefer-ts-expect-error': 'off',
      '@typescript-eslint/no-var-requires': 'off',
      '@typescript-eslint/method-signature-style': 'off',
      '@typescript-eslint/restrict-template-expressions': 'off',
      '@typescript-eslint/strict-boolean-expressions': 'off',
      '@typescript-eslint/no-unnecessary-boolean-literal-compare': 'off',
      '@typescript-eslint/ban-ts-comment': ['warn', {
          'ts-expect-error': true,
          'ts-ignore': 'allow-with-description',
          'ts-nocheck': true,
          'ts-check': false,
          minimumDescriptionLength: 5,
      }],
    },
    languageOptions: {
      globals: {
        ...globals.node,
        // ...globals.jest, // TODO can we narrow scope to just spec.js|ts?
        ...globals.browser, // TODO can we narrow scope to just the browser scripts folders?
      }
    }
  }
)
