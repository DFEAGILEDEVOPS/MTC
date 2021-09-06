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
    echo "storage account SKU required for $0 (a minimum of Standard_ZRS is recommended)"
    exit 1
fi


RES_GRP=$1
ENV=$2
SUFFIX=$3
SKU=$4

NAME="${ENV}sa${SUFFIX}"

echo "creating storage account $NAME sku:$SKU"
# https://docs.microsoft.com/en-us/cli/azure/storage/account?view=azure-cli-latest#az_storage_account_create
az storage account create -o none -n $NAME -g $RES_GRP --kind StorageV2 --sku $SKU
