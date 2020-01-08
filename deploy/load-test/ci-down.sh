#!/bin/bash

# exit on error
set -e

### Azure CLI script to initialise load-test environment with fresh database
# Delete Database

### script arguments
# $1  main resource group
# $2  sql server
# $3  sql replica server name
# $4 sql database name

RES_GROUP=$1
SQL_SERVER=$2
SQL_SERVER_REPLICA=$3
SQL_DATABASE=$4

SQL_AZURE_FQDN="database.windows.net"

az sql db delete --name $SQL_DATABASE -g $RES_GROUP --server $SQL_SERVER --no-wait
echo "delete database '$SQL_DATABASE' operation submitted to server $SQL_SERVER..."

if [ $SQL_SERVER_REPLICA ]
then
  az sql db delete --name $SQL_DATABASE -g $RES_GROUP --server $SQL_SERVER_REPLICA --no-wait
  echo "delete database $SQL_DATABASE operation submitted to server $SQL_SERVER_REPLICA..."
fi

echo "load test environment database(s) deleted"
# DONE
