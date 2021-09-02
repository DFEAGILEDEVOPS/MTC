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
SKU=${5:-Basic}
PLAN=${6:-c0}

NAME="$ENV-redis-$SUFFIX"

echo "creating redis instance $NAME sku:$SKU plan:$PLAN"
# https://docs.microsoft.com/en-us/cli/azure/redis?view=azure-cli-latest#az_redis_create
az redis create -o none -g $RES_GRP -l $LOCATION -n $NAME --sku $SKU --vm-size $PLAN --minimum-tls-version '1.2'
