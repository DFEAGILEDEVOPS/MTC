#!/usr/bin/env bash

scriptDir="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null && pwd )"

echo "Purging Azure Storage..."
(cd ${scriptDir}/admin && yarn purgestorage)

echo "Starting docker..."
docker-compose up -d

echo -n "Stabilising MS SQL Server"
for i in $(seq 1 8); do
    sleep 1
    echo -n "."
done;
echo ""

echo "Running migrations..."
(cd ${scriptDir}/admin && yarn migrate-sql)

echo "MTC Infrastructure ready!"
