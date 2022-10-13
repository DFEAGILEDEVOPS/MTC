# Upgrading the Node Runtime

This solution is heavily dependent on the Node JS runtime.
We typically upgrade to the most sensible LTS once or twice a year to stay aligned with security patching and general maintenance.

## Files to update
In order to upgrade the node runtime across the solution, you must update multiple files.
The easiest way to do this is use your editor to search for the current version string across all files in the solution.

## Update the build-agent Dockerfile
We install the current and last node versions on the build agent to ensure it can handle transitions to new versions across builds without interruption.  There are 2 variables to update in this file...
- `PREVIOUS_NODE_VERSION`
- `CURRENT_NODE_VERSION`

## Update the circle-CI Dockerfile
The Circle CI base image for pull request testing must be updated to include the least supported version of node, plus current.  Details and instructions [here](!./../../deploy/docker/circleci-node-multi/README.md)



