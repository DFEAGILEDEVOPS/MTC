# PupilSpa

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 1.2.4.

## Requirements
Run `yarn install --ignore-engines` to install all the required packages first.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `-prod` flag for a production build.

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

