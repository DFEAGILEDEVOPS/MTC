# Custom circleci docker file

## Reason

We want to run multiple versions of node in the same test matrix.  CircleCI official docker images do not provide support
for `freetds` - a library required for `tiny_tds`

## Availability

This docker image needs to be made publicly available so we can pull it in when launching our circleci jobs.

### Publishing

1. Build it

`docker build . -t stamtc/mtc_circleci_ruby`

**Note:** if you are building on Apple Silicon you also need to specify the target architecture...

`docker build . -t stamtc/mtc_circleci_ruby --platform linux/amd64`

2. Push it

`docker push stamtc/mtc_circleci_ruby:latest`
