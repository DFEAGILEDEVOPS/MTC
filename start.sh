#!/usr/bin/env bash

set -eu
set +x

scriptDir="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null && pwd )"

echo "Purging Azure Storage..."
(cd ${scriptDir}/admin && yarn purgestorage)

echo "Purging Service Bus..."
(cd ${scriptDir}/deploy/service-bus && yarn deleteqs)
(cd ${scriptDir}/deploy/service-bus && yarn createqs)

echo "Starting docker services..."
COMPOSE_DOCKER_CLI_BUILD=1 DOCKER_BUILDKIT=1 docker-compose up --build --detach

echo "Docker is starting in the background"
echo "Run: docker-compose logs -f to see the logs"
