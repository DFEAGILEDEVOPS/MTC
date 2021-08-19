#!/bin/bash
set -e

RES_GRP=$1
LOCATION=$2
ENV=$3
SUFFIX=$4
ENABLE_SOFT_DELETE=${5:-true}
RETENTION_DAYS=${6:-7}

NAME="$ENV-kv-$SUFFIX"

echo "creating key vault $NAME"
az keyvault create -o none -g $RES_GRP -n $NAME --enable-soft-delete $ENABLE_SOFT_DELETE  -retention-days $RETENTION_DAYS --no-wait
echo "key vault creation in progress (no wait enabled)"
