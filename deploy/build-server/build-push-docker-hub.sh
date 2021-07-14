#!/bin/bash
set -e

GIT_COMMIT_SHORT=$(git log -1 --format=%h)
DOCKER_BUILDKIT=1 docker build -t stamtc/devops-build-agent:latest -t stamtc/devops-build-agent:$GIT_COMMIT_SHORT .
docker push --all-tags stamtc/devops-build-agent
