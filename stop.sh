#!/usr/bin/env bash

scriptDir="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null && pwd )"

echo "Purging Azure Storage..."
(cd ${scriptDir}/admin && yarn purgestorage)

echo "Stopping docker..."
docker-compose down

echo "MTC Infrastructure down!"
