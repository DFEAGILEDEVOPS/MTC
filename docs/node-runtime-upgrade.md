# Upgrading the Node Runtime

This solution is heavily dependent on the Node JS runtime.
We typically upgrade to the most sensible LTS once or twice a year to stay aligned with security patching and general maintenance.

## Files to update

1. In order to upgrade the node runtime across the solution, you must update multiple files across the solution...
- .nvmrc files
- package.json: engines attribute, @types/node package reference in devDependencies
- Dockerfiles
  - App Dockerfiles: source image version
  - Circle CI images: source image version
  - build agent: current and previous node version environment variables

2. Build and push a new Circle CI image as per [the instructions](../deploy/docker/circleci-node-multi/README.md)

3. Construct and deploy new build agents as per [the instructions](../deploy/build-agent/readme.md)

4. Install the new node runtime locally as per [the developer guidance](../docs/developer.md)

## Update the build-agent Dockerfile

We install the current and last node versions on the build agent to ensure it can handle transitions to new versions across builds without interruption.  There are 2 variables to update in this file...
- `PREVIOUS_NODE_VERSION`
- `CURRENT_NODE_VERSION`

There is an optional 3rd Node runtime variable, which will be installed if a value is present...

- `OPTIONAL_SUPPORT_NODE_VERSION`

## Update the circle-CI Dockerfile

The Circle CI base image for pull request testing must be updated to include the least supported version of node, plus current.  Details and instructions [here](!./../../deploy/docker/circleci-node-multi/README.md)

## Upgrade the Azure functions

### Ensure function apps runtime is compatible with Node JS runtime

https://learn.microsoft.com/en-us/azure/azure-functions/functions-versions?tabs=azure-cli%2Cwindows%2Cin-process%2Cv4&pivots=programming-language-javascript#changing-version-of-apps-in-azure

### Update sync settings in package.json

Each function app has a `functionSettings` node in its package.json.  These properties are used when generating the `local.settings.json` files for local development and maintain parity with the Node runtime.

### Update the release pipeline variables to the new Node JS version and function runtime

within the VSO release library for each environment there are variables that cover the function runtime and node version respectively...

`Functions.Runtime.Version`
`Functions.Node.Version`
