# Scaling for the Psychometric Report

In order to increase concurrency and lower the amount of time required to process the entire report the following configuration changes have been made during testing...

# Func-Throttled Function App

## Runtime Settings
Add an application setting called `AzureFunctionsJobHost__Extensions__ServiceBus__MessageHandlerOptions__MaxConcurrentCalls` and set the value to `20`.  This overrides the `Extensions.ServiceBus.MessageHandlerOptions.MaxConcurrentCalls` property value in `host.json` for the entire app, allowing the function to process more messages concurrently.

## App Service Plan
Scale up to `P2V2` plan, and scale out to 2-8 instances.
