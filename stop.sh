#!/usr/bin/env bash

set -eu
set +x

scriptDir="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null && pwd )"

echo "Purging Azure Storage..."
(cd ${scriptDir}/admin && yarn purgestorage)

echo "Purging Service Bus..."
(cd ${scriptDir}/deploy/service-bus && yarn deleteqs)
(cd ${scriptDir}/deploy/service-bus && yarn createqs)

echo "Stopping docker..."
docker-compose down

echo "Resetting terminal..."
command -v reset >/dev/null 2>&1 && reset

echo "MTC Infrastructure down!"
