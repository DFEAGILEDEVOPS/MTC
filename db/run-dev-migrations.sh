#!/bin/bash

set -e
set -x

yarn install --frozen-lockfile

until ./wait-for-it.sh -h $SQL_SERVER -p $SQL_PORT -s -q -t 300
do
    echo "sqldb not available, sleeping..."
    sleep 2
done
echo "sqldb is available, starting migrations"
yarn migrate
