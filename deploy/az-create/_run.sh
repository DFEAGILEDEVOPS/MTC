#!/bin/bash
set -e

ENV=$2
SUFFIX=$3
LOCATION=$4
REDIS_SKU=$5
REDIS_PLAN=$6
ACR_SKU=$7
FRONT_DOOR_FQDN=$8
STORAGE_SKU=${9:-Standard_ZRS}
FUNCTION_SKU=${10:-B1}
WEB_SKU=${11:-B1}

RES_GRP="$ENV-rg-$SUFFIX"

echo "creating resource group $RES_GRP"
# https://docs.microsoft.com/en-us/cli/azure/group?view=azure-cli-latest#az_group_create
az group create -output none --name $RES_GRP --location $LOCATION

source ./storage-account.sh $RES_GRP $ENV $SUFFIX $SKU
source ./app-insights.sh $RES_GRP $LOCATION $ENV $SUFFIX
source ./key-vault.sh $RES_GRP $LOCATION $ENV $SUFFIX
source ./redis.sh $RES_GRP $LOCATION $ENV $SUFFIX $REDIS_SKU $REDIS_PLAN
source ./container-registry.sh $RES_GRP $ENV $SUFFIX $ACR_SKU
source ./functions.sh $RES_GRP $ENV $SUFFIX "$ENV-sa-$SUFFIX" "$ENV-ai-$SUFFIX"
source ./web.sh $RES_GRP $ENV $SUFFIX $WEB_SKU
source ./front-door.sh $RES_GRP $LOCATION $ENV $SUFFIX $FRONT_DOOR_FQDN
# TODO configure web apps behind front door
