#!/bin/bash
set -e

GIT_STATUS_OUTPUT=$(git status ./Dockerfile --porcelain)
if [ -n "$GIT_STATUS_OUTPUT" ]; then
  echo "There are uncommitted changes to the Dockerfile.
    Commit these before running this script to ensure tag consistency"
  exit 1
fi

IMAGE_NAME="stamtc/mtc-flood-agent"

GIT_COMMIT_SHORT=$(git log -1 --format=%h)
docker build -t $IMAGE_NAME:latest -t $IMAGE_NAME:$GIT_COMMIT_SHORT --platform linux/amd64 .
docker push --all-tags $IMAGE_NAME
