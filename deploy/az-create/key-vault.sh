#!/bin/bash
set -e

if [ -z "$1" ]
  then
    echo "azure resource group name required for $0"
    exit 1
fi

if [ -z "$2" ]
  then
    echo "azure location name required for $0"
    exit 1
fi

if [ -z "$3" ]
  then
    echo "target environment name required (typically dev, preprod or prod) for $0"
    exit 1
fi

if [ -z "$4" ]
  then
    echo "target environment suffix required for $0"
    exit 1
fi

RES_GRP=$1
LOCATION=$2
ENV=$3
SUFFIX=$4
RETENTION_DAYS=${5:-7}

NAME="$ENV-kv-$SUFFIX"

echo "creating key vault $NAME"
# https://docs.microsoft.com/en-us/cli/azure/keyvault?view=azure-cli-latest#az_keyvault_create
az keyvault create -o none -g $RES_GRP -n $NAME --retention-days $RETENTION_DAYS --no-wait
echo "key vault creation in progress (no wait enabled)"
