#!/usr/bin/env bash

scriptDir="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null && pwd )"

echo "Purging Azure Storage..."
(cd ${scriptDir}/admin && yarn purgestorage)

echo "Starting docker..."
(docker-compose up -d)

echo "Stabilising MS SQL Server..."
sleep 5

echo -n "Running migrations..."
(cd ${scriptDir}/admin && yarn migrate-sql)

echo "MTC Infrastructure ready!"
