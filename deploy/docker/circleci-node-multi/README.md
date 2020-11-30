# Custom circleci docker file

## Reason

We want to run multiple versions of node in the same test matrix.  CircleCI official docker images do not provide support
for multiple node versions.

## Availability

This docker image needs to be made publicly available so we can pull it in when launching our circleci jobs.Availability

### Publishing

1. Build it

$ docker build . -t stamtc/mtc_circleci

2. Push it

$ docker push stamtc/mtc_circleci:latest


