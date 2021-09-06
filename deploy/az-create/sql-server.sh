#!/bin/bash
set -e

if [ -z "$1" ]
  then
    echo "azure resource group name required for $0"
    exit 1
fi

if [ -z "$2" ]
  then
    echo "target environment name required (typically dev, preprod or prod) for $0"
    exit 1
fi

if [ -z "$3" ]
  then
    echo "target environment suffix required (typically product/service name) for $0"
    exit 1
fi

if [ -z "$4" ]
  then
    echo "sql server administrative user name required for $0"
    exit 1
fi

if [ -z "$5" ]
  then
    echo "sql server administrative user password required for $0"
    exit 1
fi

RES_GRP=$1
ENV=$2
SUFFIX=$3
ADMIN_USER=$4
ADMIN_PASSWORD=$5

NAME="$ENV-mssql-$SUFFIX"

# https://docs.microsoft.com/en-us/cli/azure/sql/server?view=azure-cli-latest#az_sql_server_create
echo "creating sql server instance $NAME"
az sql server create -o none -n $NAME -g $RES_GRP --admin-user $ADMIN_USER --admin-password $ADMIN_PASSWORD \
  --minimal-tls-version 1.2 --no-wait --assign-identity # preview feature --restrict-outbound-network-access true
