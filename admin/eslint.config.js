// manually built from scratch by guy
const globals = require('globals')
const pluginJs = require('@eslint/js')
const tseslint = require('typescript-eslint')
const jestEslint = require('eslint-plugin-jest')

module.exports = [
  {
    files: ['**/*.{js,ts}'],
    rules: {
      // GUY these are from the default file, but may prove too strict
      '@typescript-eslint/no-require-imports': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-var-requires': 'off'
    }
  },
  { files: ['**/*.js'], languageOptions: { sourceType: 'commonjs' } },
  { languageOptions: { globals: globals.node } },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.spec.js', '**/*.spec.ts'],
    plugins: { jest: jestEslint },
    languageOptions: {
      globals: jestEslint.environments.globals.globals
    },
    rules: {
      /*       'jest/no-disabled-tests': 'warn',
            'jest/no-focused-tests': 'error',
            'jest/no-identical-title': 'error',
            'jest/prefer-to-have-length': 'warn',
            'jest/valid-expect': 'error', */
      '@typescript-eslint/no-require-imports': 'off',
      'jest/consistent-test-it': ['error',
        {
          fn: 'test',
          withinDescribe: 'test'
        }],
      'jest/no-conditional-expect': 'off',
      'jest/no-jasmine-globals': 'off', // must be addressed soon, as Jasmine API is due to be phased out from Jest internals.
      'jest/no-restricted-matchers': [
        'error',
        {
          toBeFalsy: 'Ambiguous expectation. Use `toBe(false)` for boolean and `toBeDefined()` for instance verification.',
          toBeTruthy: 'Ambiguous expectation. Use `toBe(true)` for boolean and `toBeDefined()` for instance verification.',
          'not.toHaveBeenCalledWith': 'narrow expectation by using `toHaveBeenCalledWith`'
        }
      ],
      'jest/no-test-return-statement': 'error',
      'jest/no-try-expect': 'off', // a lot of code to change due to usage of fail.  removing use of fail ties in with [no-jasmine-globals] rule, as its jasmine API
      'jest/prefer-called-with': 'warn',
      'jest/prefer-spy-on': 'warn',
      'jest/prefer-strict-equal': 'error',
      'jest/prefer-todo': 'error',
      'jest/require-to-throw-message': 'warn',
      'jest/require-top-level-describe': 'error'
    }
  }
]
