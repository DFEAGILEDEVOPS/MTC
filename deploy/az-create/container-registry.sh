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

RES_GRP=$1
ENV=$2
SUFFIX=$3
SKU=${4:-Standard}

NAME="${ENV}cr${SUFFIX}"

echo "creating azure container registry $NAME sku:$SKU"
# https://docs.microsoft.com/en-us/cli/azure/acr?view=azure-cli-latest#az_acr_create
az acr create -o none -g $RES_GRP -n $NAME  --sku $SKU # TODO: only available in premium --zone-redundancy Enabled --public-network-enabled false
