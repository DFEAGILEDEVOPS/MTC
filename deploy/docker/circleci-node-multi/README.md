# Custom circleci docker file

## Reason

We want to run multiple versions of node in the same test matrix.  CircleCI official docker images do not provide support
for multiple node versions.

## Availability

This docker image needs to be made publicly available so we can pull it in when launching our circleci jobs.Availability

## Modifying
Change the base image reference to the lowest version of node the solution needs to support.  Change the nvm install list to cover all versions of node in use.

### Publishing

1. Build it

Mac Intel: `$ docker build . -t stamtc/mtc_circleci`
Mac M1: `$ docker build -t stamtc/mtc_circleci --platform linux/amd64 .`

1. Push it

$ docker push stamtc/mtc_circleci:latest


