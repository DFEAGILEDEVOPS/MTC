# tslib

## Source layout
- This project contains the typescript source code for the `func-consumption` and `func-throttled` azure functions apps.
- Each app's source is defined under `src/functions/` and `src/functions-throttled` respectively
- **This app cannot be run directly from this folder**.  To run a function app, navigate to its folder (such as `cd ../func-consumption`) and run `yarn start`.  This will invoke the build script and start the app.

## Utilities
### Linting
Run `yarn lint` to execute the linter.

We use [eslint](https://eslint.org/) via [typescript-eslint](https://github.com/typescript-eslint/typescript-eslint#readme) to enforce coding standards.

#### Linting plugins and extensions
- [standard-with-typescript](https://github.com/standard/eslint-config-standard-with-typescript#readme) for standardjs style typescript
- [eslint-plugin-jest](https://github.com/jest-community/eslint-plugin-jest#readme) to ensure consistent testing style

General configuration and rule exceptions are defined in the [eslint run commands](./.eslintrc.js) file.

### Testing
Run `yarn test` to execute the unit test suite.  This will execute the linter first, and will not proceed to unit tests if linting fails.

We use [jest](https://jestjs.io/) via [ts-jest](https://github.com/kulshekhar/ts-jest) for unit testing. Spec files should be located next to the test subject file with a `.spec.ts` extension.





