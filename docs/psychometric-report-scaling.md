# Scaling for the Psychometric Report

In order to increase concurrency and lower the amount of time required to process the entire report the following configuration changes have been made during testing...

# Func-Throttled Function App

## Runtime Settings
Add an application setting called `AzureFunctionsJobHost__extensions__serviceBus__messageHandlerOptions__maxConcurrentCalls` and set the value to `20`.  This overrides the `extensions.serviceBus.messageHandlerOptions.maxConcurrentCalls` property value in `host.json` for the entire app, allowing the function to process more messages concurrently.

*Note* The setting name is case sensitive and must match the JSON property values exactly.

## App Service Plan
Scale up to `P2V2` plan, and scale out to 2-8 instances.
