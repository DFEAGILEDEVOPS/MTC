# ps report function app

- This app serves as a runtime host for the functions maintained under `/tslib/src/functions-ps-report`
- uses Azure Functions V4
- No implementation of functional code should be defined or stored in this project.
- devDependencies are to be maintained separately from `tslib`, as this project has unique requirements

## Usage

running `yarn build` does the following...

- dependencies from `tslib/package.json` are copied to `func-ps-report/package.json`
- `func-ps-report/dist` is removed
- `yarn install` is executed in the `tslib` project
- `tslib` is transpiled and output to `func-ps-report/dist`
- non runtime outputs are removed (such as spec files)

running `yarn start` starts the function runtime host on port 7074.

## configuration

a local.settings.json file is required in the root of the project, with a minimum of these values...

```
{
  "IsEncrypted": false,
  "Values": {
    "FUNCTIONS_WORKER_RUNTIME": "node",
    "FUNCTIONS_EXTENSION_VERSION": "~4",
    "WEBSITE_NODE_DEFAULT_VERSION": "~20",
    "AzureWebJobsStorage": "{AzureWebJobsStorage}",
    "AZURE_STORAGE_CONNECTION_STRING": "#your storage account connection#",
    "AZURE_SERVICE_BUS_CONNECTION_STRING": "#your service bus connection#"
  },
  "ConnectionStrings": {}
}
```

## Disabling functions Locally

1. You need an environment variable named `AzureWebJobs.<function-name>.Disabled` set to 'true'
2. There is an example env file `disable-functions.env` in the `func-consumption` project that may be used as a reference:
    * `env $(cat disable-functions.env | grep Azure | xargs ) yarn start`
