# Dockerized AzureDevops (VSO) Build Agent

## Steps

### When there is a new Azure Pipelines Agent
update the `$AGENT_VERSION` variable in `./Dockerfile`
commit changes to ensure commit hash is aligned
execute `./build-push-docker-hub.sh` to push new image
delete existing build server container instances in azure
run `./create-instance.sh` to create new build servers
