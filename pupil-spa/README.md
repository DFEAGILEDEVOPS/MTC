# PupilSpa

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 1.2.4.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `-prod` flag for a production build.

## Environment variables

The following environment variables can be injected at start up...

|Variable   |Type/Accepted Values   |Description   |
|---|---|---|
|`FEATURE_USE_HPA`   |`true|false`   |when `false` the SPA runs in legacy mode, and communicates directly with the admin app endpoints.  `true` will run in HPA mode, with a single endpoint for login and submission of data to various azure storage queues via HTTPS   |
|`API_URL`   |`url`   |in HPA mode this should target the pupil API.  In legacy mode it should be the base URL of the admin app   |
|`AUTH_URL`   |`url`   |Legacy mode only.  The full URL for pupil authentication   |
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
|`SUPPORT_NUMBER`   |`telephone number`   |The telephone number for helpdesk support   |
|`WEBSITE_OFFLINE`   |`true / false`   |Disables the pupil spa and shows a downtime message   |

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).
Before running the tests make sure you are serving the app via `ng serve`.

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
## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).

### Upgrading old versions

You can upgrade an old version like this:

```shell
npm uninstall -g angular-cli
npm uninstall -g @angular/cli
npm cache --force clean
npm install -g @angular/cli
``` 

