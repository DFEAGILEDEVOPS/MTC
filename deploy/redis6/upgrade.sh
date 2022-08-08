#!/bin/bash

# set errors on
set -e

# upgrade a redis 4 instance to v6

if [ -z "$1" ]
  then
    echo "azure resource group name required for $0"
    exit 1
fi

if [ -z "$2" ]
  then
    echo "azure redis cache instance name required for $0"
    exit 1
fi

RES_GROUP=$1
CACHE_NAME=$2

echo "upgrading redis instance $CACHE_NAME to v6"
az redis update --name $CACHE_NAME --resource-group $RES_GROUP --set redisVersion=6
