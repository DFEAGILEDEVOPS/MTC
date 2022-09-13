module.exports = {
  root: true,
  env: {
    node: true,
    jest: true
  },
  rules: {
    'no-return-await': 'off',
    'object-shorthand': 'off'
  },
  ignorePatterns: [
    'assets/javascripts/jquery-3.5.1.js',
    'assets/vendor-js/*',
    'dist/',
    'public/',
    '**/*.ts'
  ],
  extends: [
    'standard'
  ],

  // =================================
  // Overrides for Specific Files
  // =================================
  overrides: [
    {
      files: ['**/*.{ts,tsx}'],

      // Global ESLint Settings
      // =================================
      env: {
        jest: true,
        node: true
      },
      settings: {
        'import/parsers': {
          '@typescript-eslint/parser': ['.ts', '.tsx']
        },
        'import/resolver': {
          typescript: {
            project: './tsconfig.json'
          }
        }
      },

      // Parser Settings
      // =================================
      // allow ESLint to understand TypeScript syntax
      // https://github.com/iamturns/eslint-config-airbnb-typescript/blob/master/lib/shared.js#L10
      parser: '@typescript-eslint/parser',
      parserOptions: {
        // Lint with Type Information
        // https://github.com/typescript-eslint/typescript-eslint/blob/master/docs/getting-started/linting/TYPED_LINTING.md
        tsconfigRootDir: __dirname,
        project: './tsconfig.json'
      },

      // Plugins
      // =================================
      plugins: [
        '@typescript-eslint'
      ],
      extends: [
        'standard-with-typescript',
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:@typescript-eslint/eslint-recommended',
        'plugin:@typescript-eslint/recommended-requiring-type-checking',
        'plugin:import/errors',
        'plugin:import/warnings',
        'plugin:import/typescript'
      ]
    }
  ]
}
