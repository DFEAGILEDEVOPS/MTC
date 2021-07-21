#!/bin/bash
set -e

GIT_STATUS_OUTPUT=$(git status ./Dockerfile --porcelain)
if [ -n "$GIT_STATUS_OUTPUT" ]; then
  echo "There are uncommitted changes to the Dockerfile.
    Commit these before running this script to ensure tag consistency"
  exit 1
fi

GIT_COMMIT_SHORT=$(git log -1 --format=%h)
DOCKER_BUILDKIT=1 docker build -t stamtc/devops-build-agent:latest -t stamtc/devops-build-agent:$GIT_COMMIT_SHORT .
docker push --all-tags stamtc/devops-build-agent
