# throttled app plan function runtime host

- This app serves as a runtime host for the functions maintained under `/tslib/src/functions-throttled`
- uses Azure Functions V3
- No implementation of functional code should be defined or stored in this project.
- devDependencies are to be maintained separately from `tslib`, as this project has unique requirements

## Usage

running `yarn start` does the following...

- dependencies from `tslib/package.json` are copied to `func-throttled/package.json`
- `func-throttled/dist` is removed
- `yarn install` is executed in the `tslib` project
- `tslib` is transpiled and output to `func-throttled/dist`
- non runtime outputs are removed (such as spec files)
- the function runtime host is started, and the functions are operational

## configuration

a local.settings.json file is required in the root of the project, with a minimum of these values...

```
{
  "IsEncrypted": false,
  "Values": {
    "FUNCTIONS_WORKER_RUNTIME": "node",
    "FUNCTIONS_EXTENSION_VERSION": "~4",
    "WEBSITE_NODE_DEFAULT_VERSION": "~16",
    "AzureWebJobsStorage": "{AzureWebJobsStorage}",
    "AZURE_STORAGE_CONNECTION_STRING": "#your storage account connection#",
    "AZURE_SERVICE_BUS_CONNECTION_STRING": "#your service bus connection#"
  },
  "ConnectionStrings": {}
}
```

## Disabling functions Locally

1. You need an environment variable named `AzureWebJobs.<function-name>.Disabled` set to 'true'
2. There is an example env file `disable-functions.env` that may be used:
    * `env $(cat disable-functions.env | grep Azure | xargs ) yarn start`
