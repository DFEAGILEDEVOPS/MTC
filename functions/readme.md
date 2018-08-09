# MTC Azure Functions

See [offical documentation](https://docs.microsoft.com/en-us/azure/azure-functions/functions-reference-node) for full
developer reference.

We are targeting V2, which is currently in preview.

## Pre-requisites

- Install Azure Functions Core tools as per [the documentation](https://github.com/Azure/azure-functions-core-tools).

## Running locally

execute `func host start` from `functions` directory.  A shortcut script has been added to `package.json` so you can
also just call `yarn start` if you prefer.

## Creating a new function

From the `functions` directory, execute `func function new`.

## Installing package dependencies

npm packages should be installed in the `functions` root folder, not in each function directory.

