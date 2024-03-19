# Dockerized AzureDevops (VSO) Build Agent

## Purpose

- `build-push-docker-hub.sh` Builds the build agent docker image and pushes it to docker hub.  Any changes must be committed before running this script, as the commit hash is used for the image tag.
- `cleanup.sh` Removes any temporary files and 'dead weight' from the image before it is finished building.  You do not need to execute this script, as it is called from within the Dockerfile itself.
- `create-instance.sh` creates a container instance using the latest image in docker hub, via the Azure CLI.

## NOTE: Apple Silicon
If you are building the image locally on an Apple Silicon device during developmet, you should use the `--platform linux/amd64` argument with the `docker build` command.  Otherwise, it will default to arm64, which lacks parity with the target hardware, and causes a lot of incompatibility issues during the image build.

## Steps
1. update the `$AGENT_VERSION` variable in `./Dockerfile` to the [latest full release](https://github.com/microsoft/azure-pipelines-agent/releases)
2. commit changes to ensure commit hash is aligned
3. execute `./build-push-docker-hub.sh` to push new image
4. delete existing build server container instances in azure
5. run `./create-instance.sh` to create new build servers
6. once new agents are up and running, assign a 'user defined capability' to each one via the build agent management screen in VSO.
7. Add name as `mtc-instance` and number them consecutively, starting at 1.  This allows us to source and whitelist the IP address of each.
8. Source the IPv4 address of each build server using the build definitions located in the MTC Azure DevOps instance
9. Add these IP addresses to the necessary firewalls using the build tasks provided in the MTC Azure DevOps instance

example execution of `create-instance.sh`...

```bash
> ./create-instance.sh machine-name my-resource-group <pat token> https://my-azure-devops-instance.visualstudio.com
```
