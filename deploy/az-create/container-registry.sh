#!/bin/bash
set -e

RES_GRP=$1
ENV=$2
SUFFIX=$3
SKU=${4:-Standard}

NAME="${ENV}cr${SUFFIX}"

echo "creating azure container registry $NAME sku:$SKU"
# https://docs.microsoft.com/en-us/cli/azure/acr?view=azure-cli-latest#az_acr_create
az acr create -o none -g $RES_GRP -n $NAME  --sku $SKU # TODO: only available in premium --zone-redundancy Enabled --public-network-enabled false
