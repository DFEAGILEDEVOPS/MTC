#!/bin/bash
set -e

# create all azure resources for MTC deployment
# This script assumes that `az account set` has been run to target an active subscription

ENV=$1
SUFFIX=$2
LOCATION=$3
REDIS_SKU=$4
REDIS_PLAN=$5
ACR_SKU=$6
FRONT_DOOR_FQDN=$7
STORAGE_SKU=${8:-Standard_ZRS}
FUNCTION_SKU=${9:-B1}
WEB_SKU=${10:-B1}
SERVICE_BUS_SKU=${11:-Standard}

RES_GRP="$ENV-rg-$SUFFIX"

echo "creating resource group $RES_GRP"
# https://docs.microsoft.com/en-us/cli/azure/group?view=azure-cli-latest#az_group_create
az group create -o none -n $RES_GRP -l $LOCATION

source ./app-insights.sh $RES_GRP $LOCATION $ENV $SUFFIX
source ./front-door.sh $RES_GRP $LOCATION $ENV $SUFFIX $FRONT_DOOR_FQDN
# TODO configure web apps behind front door
source ./redis.sh $RES_GRP $LOCATION $ENV $SUFFIX $REDIS_SKU $REDIS_PLAN
source ./service-bus.sh $RES_GRP $ENV $SUFFIX $SERVICE_BUS_SKU
source ./storage-account.sh $RES_GRP $ENV $SUFFIX $STORAGE_SKU
source ./key-vault.sh $RES_GRP $LOCATION $ENV $SUFFIX
source ./container-registry.sh $RES_GRP $ENV $SUFFIX $ACR_SKU
source ./functions.sh $RES_GRP $ENV $SUFFIX "${ENV}sa${SUFFIX}" "$ENV-ai-$SUFFIX" $FUNCTION_SKU
source ./web.sh $RES_GRP $ENV $SUFFIX $WEB_SKU "$ENV-ai-$SUFFIX"
echo "resource group $RES_GRP creation complete"
