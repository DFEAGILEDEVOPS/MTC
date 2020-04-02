# Azure Queue Service

Provides a wrapper around the [Azure Storage JS library](https://azure.github.io/azure-storage-node/index.html).
Project location: `pupil-spa/src/public/azure-storage/azure-storage.queue.min.js`
Declared in `pupil-spa/angular.json`

## Components used

[Linear Retry Policy Filter](https://azure.github.io/azure-storage-node/LinearRetryPolicyFilter.html) - provides retry functionality, with configurable values
Dependent on the following entries in `src/public/config.json`
- `testPupilConnectionMaxRetries`: number of retry attempts if the initial one fails
- `testPupilConnectionRetryDelay`: number of milliseconds to wait between retry attempts
