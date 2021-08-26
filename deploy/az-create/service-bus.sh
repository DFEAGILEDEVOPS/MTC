#!/bin/bash
set -e

RES_GRP=$1
ENV=$2
SUFFIX=$3
SKU=${4:-Standard}

NAME="$ENV-sb-$SUFFIX"

# https://docs.microsoft.com/en-us/cli/azure/servicebus/namespace?view=azure-cli-latest#az_servicebus_namespace_create
echo "creating service bus namespace $NAME"
az servicebus namespace create -o none -g $RES_GRP -n $NAME --sku $SKU

USER_OWNER="$ENV-sb-auth-owner-$SUFFIX"
# create account for entity management
echo "creating service bus manager account $USER_OWNER"
az sevicebus namespace authorization-rule create -n $USER_OWNER --namespace-name $NAME -g $RES_GRP --rights Manage

USER_CONSUMER="$ENV-sb-auth-consumer-$SUFFIX"
# create account for consumers
echo "creating service bus consumer account $USER_CONSUMER"
az sevicebus namespace authorization-rule create -n $USER_CONSUMER --namespace-name $NAME -g $RES_GRP --rights Listen Send
