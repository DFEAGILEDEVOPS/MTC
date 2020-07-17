#!/usr/bin/env bash

set -eu
set +x

scriptDir="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null && pwd )"

echo "Purging Azure Storage..."
(cd ${scriptDir}/admin && yarn purgestorage)

echo "Purging Service Bus..."
(cd ${scriptDir}/deploy/service-bus && yarn deleteqs)
(cd ${scriptDir}/deploy/service-bus && yarn createqs)

echo "Starting docker..."
docker-compose up -d

echo -n "Stabilising MS SQL Server"
for i in $(seq 1 8); do
    sleep 1
    if docker exec -it mtc_mssql /opt/mssql-tools/bin/sqlcmd -U SA -P 'Mtc-D3v.5ql_S3rv3r' -Q 'SELECT "database_is_up"' | grep -q database_is_up; then
        echo " done"
        break
    fi
    echo -n "."
done
echo ""

echo "Resetting terminal..."
command -v reset >/dev/null 2>&1 && reset

echo "Running migrations..."
(cd ${scriptDir}/admin && yarn migrate-sql)

echo "Running seeds..."
(cd ${scriptDir}/admin && yarn seed-sql)

echo "MTC Infrastructure ready!"
