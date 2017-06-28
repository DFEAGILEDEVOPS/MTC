# Management of Docker Swarm in Azure Container Service (ACS)

[Documentation Source](https://docs.microsoft.com/en-gb/azure/container-service/container-service-connect)

## Setup Remote Management

Do not connect directly to the master via SSH, as this causes issues such as containers being provisioned on the master and container addresses do not resolve correctly. 

### Obtain credentials

Speak to Guy for the key pair and passphrase.

### Create a tunnel 

`ssh -fNL 2375:localhost:2375 -p 2200 myswarm@some.azure.server.azure.com -i ~/.ssh/my-private-key`

Observe the tunnel is open and running in the background with...

`ps aux | grep 2375`

### Set Local Docker Client Port for current terminal tab

`export DOCKER_HOST=:2375`

### Check you are connected

execute...

`docker info`

this should output info from the ACS instance, and the number of agents should match Azure.

## Provision a container

The container are deployed using VSO.  We have a build process that creates and publishes the check application image, and a release process that then deploys the image to the dev instance.  Builds can be promoted to the beta 'June Trial' environment by approving the release to beta.

## Other Commands

Tear down containers with....

`docker stop $(docker ps -a -q) && docker rm $(docker ps -a -q)`


[Next Step: Deploying from VSO](acs-deploy.md)



