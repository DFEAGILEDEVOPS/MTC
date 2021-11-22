# PR Regression Test utility

The purpose of this script is to build and run an instance of MTC in docker compose that can be tested against.

## Usage

Execute `_run.sh` to build and run the instance of MTC.

This will ensure that the function apps are built first and the necessary assets are copied into the function app folders for the docker compose build.

### Environment Variables

- `AZURE_STORAGE_CONNECTION_STRING` required.  Connection string to target azure storage instance.
- `AZURE_SERVICE_BUS_CONNECTION_STRING` required.  Connection string to target service bus instance.
- `SQL_TECH_SUPPORT_USER_PASSWORD` required.  Password for the tech support sql account.
- `SQL_FUNCTIONS_APP_USER` required.  Username for the functions app sql account.
- `SQL_FUNCTIONS_APP_USER_PASSWORD` required.  Username for the functions app sql account.
