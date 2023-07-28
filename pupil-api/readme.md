# MTC Pupil API

## Dependencies

You need to have node installed

- [node](https://nodejs.org/) - Node javascript runtime
- [NPM packages](https://www.npmjs.org) installed globally (for developers): `yarn`
- [Docker](https://www.docker.com/get-docker) - Docker to run containers

We recommend developers manage their `node` and `npm` packages using [nvm](http://nvm.sh)

## Packages

You _can_ use npm to install application packages, but we prefer [yarn](https://yarnpkg.com/lang/en/)
You can then install all required dependencies by running:

`yarn install`

See the [package.json](./package.json) file for the full list of npm dependencies.

## Please Note

All code from this application is now contained within the `tslib/pupil-api` folder, as this lowers the overall cost of dependency management.
Running `yarn build` will copy over any `dependencies` from `tslib/package.json` into `pupil-api/package.json`.  All `devDependencies` remain independent.  Once built the transpiled typescript will be in the `pupil-api/dist` folder, ready to run the app.

## Running the application

`AZURE_STORAGE_CONNECTION_STRING=xxx AZURE_SERVICE_BUS_CONNECTION_STRING=xxx yarn start`

Will launch the app in development mode on http://localhost:3003/

CORS is disabled in development. In production the whitelist can be configured using the CORS_WHITELIST environment variable.

## Environment Variables

dotenv is installed and will load environment variables from a `.env` file stored in the root of the admin application,
if you have created one.  See [documentation](https://www.npmjs.com/package/dotenv) for more info.

* AZURE_STORAGE_CONNECTION_STRING - (required when redis prepared checks disable) - Storage account for upload file storage and queues.  Upload is only enabled for
    production environments, but the queues are used by all environments.
* AZURE_SERVICE_BUS_CONNECTION_STRING - (required only when redis prepared checks enabled) - service bus for sending pupil login messages.
* ENVIRONMENT_NAME - string - defaults to `Local-Dev`
* PORT - number - defaults to `3003`
* LOG_LEVEL - string - defaults to `debug`
* EXPRESS_LOGGING_WINSTON - bool - defaults to `false`
* CORS_WHITELIST - string - Can be a comma separated list
* APPINSIGHTS_WINSTON_LOGGER - bool - defaults to `false`
* APPINSIGHTS_INSTRUMENTATIONKEY - string

## Running the test suite

`yarn test`
