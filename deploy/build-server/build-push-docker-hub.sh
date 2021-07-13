#!/bin/bash
set -e

DOCKER_BUILDKIT=1 docker build -t stamtc/devops-build-agent:latest .
docker push stamtc/devops-build-agent:latest
