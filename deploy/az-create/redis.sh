#!/bin/bash
set -e

RES_GRP=$1
LOCATION=$2
ENV=$3
SUFFIX=$4
SKU=${5:-Basic}
PLAN=${6:-c0}

NAME="$ENV-redis-$SUFFIX"
echo "creating redis instance $NAME sku:$SKU plan:$PLAN"
az redis create -o none -g $RES_GRP -l $LOCATION -n $NAME --sku $SKU --vm-size $PLAN --minimum-tls-version '1.2'
