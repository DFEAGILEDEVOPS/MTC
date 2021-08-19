#!/bin/bash
set -e

RES_GRP=$1
LOCATION=$2
ENV=$3
SUFFIX=$4
RETENTION_DAYS=${5:-7}

NAME="$ENV-kv-$SUFFIX"

echo "creating key vault $NAME"
az keyvault create -o none -g $RES_GRP -n $NAME --retention-days $RETENTION_DAYS --no-wait
echo "key vault creation in progress (no wait enabled)"
