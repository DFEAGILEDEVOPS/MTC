#!/bin/bash
set -e

RES_GRP=$1
ENV=$2
SUFFIX=$3
SKU=$4

NAME="${ENV}sa${SUFFIX}"

echo "creating storage account $NAME sku:$SKU"
# https://docs.microsoft.com/en-us/cli/azure/storage/account?view=azure-cli-latest#az_storage_account_create
az storage account create -o none -n $NAME -g $RES_GRP --kind StorageV2 --sku $SKU
