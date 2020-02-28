# Functions App

For long-running functions

## Disabling functions Locally

1. You need an environment variable named `AzureWebJobs.<function-name>.Disabled` set to 'true'
2. There is an example env file `disable-functions.env` that may be used:
    * `env $(cat disable-functions.env | grep Azure | xargs ) yarn start`

## Creating a new function

From the `functions` directory, execute `func function new`.

## Installing package dependencies

yarn packages should be installed in the `functions` root folder, not in each function directory.

## Environment Variables

| Env Var name | Default Value | Component |
| --- | --- | --- |
| SQL_CENSUS_REQUEST_TIMEOUT | 2 hours | Census Upload |

