const eslint = require('@eslint/js')
const tseslint = require('typescript-eslint')
const pluginJest = require('eslint-plugin-jest');
const globals = require('globals')

module.exports = tseslint.config(
  eslint.configs.recommended,
  tseslint.configs.strict,
  tseslint.configs.stylisticTypeChecked,
  {
    plugins: {
      pluginJest
    },
    languageOptions: {
      parserOptions: {
        tsconfigRootDir: __dirname,
        projectService: true,
        warnOnUnsupportedTypeScriptVersion: true
      }
    },
    rules: {
      'no-return-await': 'off',
      'no-empty': 'off',
      '@typescript-eslint/no-extraneous-class': 'off',
      '@typescript-eslint/return-await': ['error', 'in-try-catch'],
      '@typescript-eslint/prefer-ts-expect-error': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/method-signature-style': 'off',
      '@typescript-eslint/restrict-template-expressions': 'off',
      '@typescript-eslint/no-confusing-void-expression': 'off',
      '@typescript-eslint/no-var-requires': 'off',
      '@typescript-eslint/no-require-imports': ['error', {
        allow: ['ramda-adjunct', 'helmet']
      }],
      '@typescript-eslint/prefer-regexp-exec': 'off',
      '@typescript-eslint/no-empty-function': 'off',
      '@typescript-eslint/ban-ts-comment': ['warn', {
          'ts-expect-error': true,
          'ts-ignore': 'allow-with-description',
          'ts-nocheck': true,
          'ts-check': false,
          minimumDescriptionLength: 5,
      }]
    }
  },
  {
    // update this to match your test files
    files: ['**/*.spec.ts'],
    plugins: { jest: pluginJest },
    languageOptions: {
      globals: {
        // ...pluginJest.environments.globals.globals,
        ...globals.jest,
        ...globals.jasmine
      },
    },
    rules: {
      'jest/consistent-test-it': ['error', {
        fn: 'test',
        withinDescribe: 'test',
    }],
      'jest/no-conditional-expect': 'off',
      'jest/no-jasmine-globals': 'off',
      'jest/no-restricted-matchers': ['error', {
          toBeFalsy: 'Ambiguous expectation. Use `toBe(false)` for boolean and `toBeDefined()` for instance verification.',
          toBeTruthy: 'Ambiguous expectation. Use `toBe(true)` for boolean and `toBeDefined()` for instance verification.',
          'not.toHaveBeenCalledWith': 'narrow expectation by using `toHaveBeenCalledWith`',
    }],
      'jest/no-test-return-statement': 'error',
      'jest/no-try-expect': 'off',
      'jest/prefer-called-with': 'warn',
      'jest/prefer-spy-on': 'warn',
      'jest/prefer-strict-equal': 'error',
      'jest/prefer-todo': 'error',
      'jest/require-to-throw-message': 'warn',
      'jest/require-top-level-describe': 'error',
    },
  },
  {
    ignores: [
      'node_modules/',
      'dist/',
      'coverage/',
      '**/*.js'
    ],
  }
)
