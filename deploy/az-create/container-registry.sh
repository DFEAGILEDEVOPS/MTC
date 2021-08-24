#!/bin/bash
set -e

RES_GRP=$1
ENV=$2
SUFFIX=$3
SKU=${4:-Basic}

NAME="$ENV-cr-$SUFFIX"

echo "creating azure container registry $NAME sku:$SKU"
az acr create -o none -g $RES_GRP -n $NAME  --sku $SKU --public-network-enabled false --zone-redundancy true
