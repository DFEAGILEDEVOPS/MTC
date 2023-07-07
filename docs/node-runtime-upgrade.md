# Upgrading the Node Runtime

This solution is heavily dependent on the Node JS runtime.
We typically upgrade to the most sensible LTS once or twice a year to stay aligned with security patching and general maintenance.

## Files to update

In order to upgrade the node runtime across the solution, you must update multiple files across the solution.
- .nvmrc files
- package.json: engines attribute
- Dockerfiles
  - App Dockerfiles: source image version
  - Circle CI images: source image version
  - build agent: current and previous node version environment variables

## Update the build-agent Dockerfile

We install the current and last node versions on the build agent to ensure it can handle transitions to new versions across builds without interruption.  There are 2 variables to update in this file...
- `PREVIOUS_NODE_VERSION`
- `CURRENT_NODE_VERSION`

## Update the circle-CI Dockerfile

The Circle CI base image for pull request testing must be updated to include the least supported version of node, plus current.  Details and instructions [here](!./../../deploy/docker/circleci-node-multi/README.md)

## Upgrade the Azure functions

### Ensure function apps runtime is compatible with Node JS runtime

https://learn.microsoft.com/en-us/azure/azure-functions/functions-versions?tabs=azure-cli%2Cwindows%2Cin-process%2Cv4&pivots=programming-language-javascript#changing-version-of-apps-in-azure

### Update the release pipeline variables to the new Node JS version and function runtime

within the VSO release library for each environment there are variables that cover the function runtime and node version respectively...

`Functions.Runtime.Version`
`Functions.Node.Version`
