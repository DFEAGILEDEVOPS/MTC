# PupilSpa

## Development server

Run `yarn start` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|module`.

## Build

Run `yarn build` to build the project. The build artifacts will be stored in the `dist/` directory. 

## Environment variables

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
|`SUPPORT_NUMBER`   |`telephone number`   |The telephone number for helpdesk support   |
|`WEBSITE_OFFLINE`   |`true / false`   |Disables the pupil spa and shows a downtime message   |

## SAS Token

When generating a SAS token, you must ensure you set the following...
|Type   |Value    |
|---|---|
|`Allowed Services`   |`Queue`    |
|`Allowed Resource Types`|    `Object`    |
|`Allowed Permissions`|   `Add`   |

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

Sass include paths are setup in angular.json to allow these scss files to be pulled in directly.



## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).
