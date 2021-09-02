#!/bin/bash
set -e

if [ -z "$1" ]
  then
    echo "azure resource group name required for $0"
    exit 1
fi

if [ -z "$2" ]
  then
    echo "target environment name required (typically dev, preprod or prod) for $0"
    exit 1
fi

if [ -z "$3" ]
  then
    echo "target environment suffix required (typically product/service name) for $0"
    exit 1
fi

if [ -z "$4" ]
  then
    echo "storage account name required for $0"
    exit 1
fi

if [ -z "$5" ]
  then
    echo "app insights instance name required for $0"
    exit 1
fi

if [ -z "$6" ]
  then
    echo "app service plan type required for $0"
    exit 1
fi

RES_GRP=$1
ENV=$2
SUFFIX=$3
STORAGE_ACCOUNT=$4
APP_INSIGHTS_NAME=$5
SKU=$6

# automatically creates a single app service plan to host both function apps.
# This is solely because one function app runs during the day, and
# the other hosts overnight jobs only.

ASP_NAME="$ENV-func-asp-$SUFFIX"
echo "creating function app service plan $ASP_NAME sku:$SKU"
# https://docs.microsoft.com/en-us/cli/azure/appservice/plan?view=azure-cli-latest#az_appservice_plan_create
az appservice plan create -o none -n $ASP_NAME -g $RES_GRP --is-linux --sku $SKU

NAME="$ENV-func-day-$SUFFIX"

# https://docs.microsoft.com/en-us/cli/azure/functionapp?view=azure-cli-latest#az_functionapp_create
echo "creating function app $NAME"
az functionapp create -o none -n $NAME -g $RES_GRP --functions-version 3 --runtime node --runtime-version 12 \
  --plan $ASP_NAME --storage-account $STORAGE_ACCOUNT --app-insights $APP_INSIGHTS_NAME

NAME="$ENV-func-night-$SUFFIX"

echo "creating function app $NAME"
az functionapp create -o none -n $NAME -g $RES_GRP --functions-version 3 --runtime node --runtime-version 12 \
  --plan $ASP_NAME --storage-account $STORAGE_ACCOUNT --app-insights $APP_INSIGHTS_NAME
