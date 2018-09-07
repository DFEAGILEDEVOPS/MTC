# MTC Azure Functions

See [offical documentation](https://docs.microsoft.com/en-us/azure/azure-functions/functions-reference-node) for full
developer reference.

We are targeting V2, which is currently in preview.

## Pre-requisites

- Install Azure Functions Core tools as per [the documentation](https://github.com/Azure/azure-functions-core-tools).

  `npm i -g azure-functions-core-tools@core --unsafe-perm true`

- For versions of `azure-functions-core-tools >= 2.0.1-beta.37` you also need to install the extensions

    `func extensions install`
    
NB: you can review what npm packages and versions are installed:
    `npm list -g --depth=0`  

## Running locally

execute `func host start` from `functions` directory.  A shortcut script has been added to `package.json` so you can
also just call `yarn start` if you prefer.

## Creating a new function

From the `functions` directory, execute `func function new`.

## Installing package dependencies

npm packages should be installed in the `functions` root folder, not in each function directory.

