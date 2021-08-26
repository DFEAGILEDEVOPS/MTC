#!/bin/bash
set -e

RES_GRP=$1
ENV=$2
SUFFIX=$3
SKU=${4:-Standard}

NAME="$ENV-sb-$SUFFIX"

# https://docs.microsoft.com/en-us/cli/azure/servicebus/namespace?view=azure-cli-latest#az_servicebus_namespace_create
az servicebus namespace create -o none -g $RES_GRP -n $NAME --sku $SKU
