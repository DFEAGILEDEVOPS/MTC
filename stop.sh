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

echo "MTC Infrastructure down!"
