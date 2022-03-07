#!/usr/bin/env bash

set -eu
set +x

scriptDir="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null && pwd )"

echo "Purging Azure Storage..."
(cd ${scriptDir}/admin && yarn purgestorage)

echo "Purging Service Bus..."
(cd ${scriptDir}/deploy/service-bus && yarn deleteqs)
(cd ${scriptDir}/deploy/service-bus && yarn createV2)

echo "Stopping docker..."
docker-compose down

echo "Cleaning local uploaded files..."
find ${scriptDir}/admin/data/files \( -mindepth 1 -and ! -iname README.md \) -print0 | xargs -0 /bin/rm -rf

echo "Cleaning e2e test run screenshots..."
find ${scriptDir}/test/admin-hpa/screenshots ${scriptDir}/test/pupil-hpa/screenshots -type f -name "*.png" -mtime +2 \
 -print0 | xargs -0 /bin/rm -rf

echo "Resetting terminal..."
command -v reset >/dev/null 2>&1 && reset

echo "MTC Infrastructure down!"
