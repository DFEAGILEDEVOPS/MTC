# PupilSpa

## Development server

Run `yarn start` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `-prod` flag for a production build.

## Environment variables
For local development a `.env` file is required at the project's root directory which provides the following environment

|Variable   |Type/Accepted Values   |Description   |
|---|---|---|
|`TEST_PUPIL_CONNECTION_QUEUE_URL`   |`url`   | The test pupil connectivity queue URL required for submitting a test message |
|`TEST_PUPIL_CONNECTION_QUEUE_TOKEN`   |`url`   | The test pupil connectivity queue token required for submitting a test message |

The following environment variables can be injected at start up...

|Variable   |Type/Accepted Values   |Description   |
|---|---|---|
|`API_URL`   |`url`   |in HPA mode this should target the pupil API.  In legacy mode it should be the base URL of the admin app   |
|`AUTH_URL`   |`url`   | The full URL for pupil authentication   |
|`AUTH_PING_URL`   |`url`   | The full URL for pinging pupil authentication |
|`CHECK_STARTED_URL`   |`url`   |Legacy mode only.  The full URL for check start notification   |
|`CHECK_SUBMISSION_URL`   |`url`   |Legacy mode only.  The full URL for check submission   |
|`PRODUCTION`   |`true / false`   |Production or debug mode   |
|`APPINSIGHTS_INSTRUMENTATIONKEY`   |`uuid`   |The instrumentation key of the Application insights instance   |
|`GA_CODE`   |`string`   |The unique identifier of the Google analytics instance   |
|`CHECK_START_ERROR_DELAY`   |`integer`   |The delay in milliseconds between attempts to submit the check started notification   |
|`CHECK_START_MAX_ATTEMPTS`   |`integer`   |The max number of attempts in submitting the check started notification   |
|`CHECK_SUBMISSION_ERROR_DELAY`   |`integer`   |The delay in milliseconds between attempts to submit the completed check   |
|`CHECK_SUBMISSION_MAX_ATTEMPTS`   |`integer`   |The max number of attempts in submitting the completed check   |
|`SUBMISSION_PENDING_MIN_DISPLAY`   |`integer`   |The minimum amount of time in milliseconds that the completed check submission pending view should display for   |
|`CONNECTIVITY_CHECK_MIN_DISPLAY`   |`integer`   |The minimum amount of time in milliseconds that the connectivity check view should display for   |
|`SUPPORT_NUMBER`   |`telephone number`   |The telephone number for helpdesk support   |
|`WEBSITE_OFFLINE`   |`true / false`   |Disables the pupil spa and shows a downtime message   |
|`TEST_PUPIL_CONNECTION_QUEUE_NAME`   |`string`   | The test pupil connectivity queue name required for submitting a test message |
|`TEST_PUPIL_CONNECTION_QUEUE_URL`   |`url`   | The test pupil connectivity queue URL required for submitting a test message |
|`TEST_PUPIL_CONNECTION_QUEUE_TOKEN`   |`string`   | The test pupil connectivity queue token required for submitting a test message |
|`TEST_PUPIL_CONNECTION_ERROR_DELAY`   |`integer`   | The delay in milliseconds between attempts in submitting a message to the test queue   |
|`TEST_PUPIL_CONNECTION_MAX_ATTEMPTS`   |`integer`   | The max number of attempts in submitting a message to the test queue   |

## Running unit tests

Run `yarn test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Connecting from Virtualised Clients

If you want to connect from a Virtualised client, perhaps for browser testing you may see this error:

```
Invalid Host header
```

This is a security precaution in the server.  You can temporarily allow them by starting 
the server like this: 

```shell
ng serve --disable-host-check
```

For Virtualbox users you can then access the site running on the Host's localhost by connecting to

```
http://10.0.2.2:<$port>/
```


## Frontend Notes

The GDS libraries are included in the package.json file: `govuk-elements-sass` which has as its dependency `govuk_frontend_toolkit`

On `postinstall` yarn runs two jobs to vendor in the govuk files as angular cannot use sass files from node_modules directly:

1. `tools/copyGovukFrontendToolkit`- this copies the `stylesheets`, `javascripts` and `images` folders from `node_modules`  to `~/src/assets/govuk_frontend_toolkit` making them available to the angular solution.
2. `tools/copyGovukElements` - this copies sass files used by the gov-frontend-toolkit to `~/src/assets/govuk-elements-sass`



## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).

