#!/bin/bash
set -e

REGISTRY_NAME=$1

GIT_STATUS_OUTPUT=$(git status ./Dockerfile --porcelain)
if [ -n "$GIT_STATUS_OUTPUT" ]; then
  echo "There are uncommitted changes to the Dockerfile.
    Commit these before running this script to ensure tag consistency"
  exit 1
fi

GIT_COMMIT_SHORT=$(git log -1 --format=%h)
docker build -t $REGISTRY_NAME.azurecr.io/devops-build-agent:latest -t $REGISTRY_NAME.azurecr.io/devops-build-agent:$GIT_COMMIT_SHORT --platform linux/amd64 .
docker push --all-tags $REGISTRY_NAME.azurecr.io/devops-build-agent
