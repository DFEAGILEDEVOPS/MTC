#!/bin/bash
set -e

RES_GRP=$1
ENV=$2
SUFFIX=$3
ADMIN_USER=$4
ADMIN_PASSWORD=$5


NAME="$ENV-mssql-$SUFFIX"

# https://docs.microsoft.com/en-us/cli/azure/sql/server?view=azure-cli-latest#az_sql_server_create
echo "creating sql server instance $NAME"
az sql server create -o none -n $NAME -g $RES_GRP --admin-user $ADMIN_USER --admin-password $ADMIN_PASSWORD \
  --minimal-tls-version 1.2 --no-wait --assign-identity --restrict-outbound-network-access true
