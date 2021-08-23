#!/bin/bash
set -e

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
az appservice plan create -o none -n $ASP_NAME -g $RES_GRP --is-linux --sku $SKU

NAME="$ENV-func-day-$SUFFIX"

echo "creating function app $NAME"
az functionapp create -o none -n $NAME -g $RES_GRP --functions-version 3 --runtime node --runtime-version 12 \
  --plan $ASP_NAME --storage-account $STORAGE_ACCOUNT --app-insights $APP_INSIGHTS_NAME

NAME="$ENV-func-night-$SUFFIX"

echo "creating function app $NAME"
az functionapp create -o none -n $NAME -g $RES_GRP --functions-version 3 --runtime node --runtime-version 12 \
  --plan $ASP_NAME --storage-account $STORAGE_ACCOUNT --app-insights $APP_INSIGHTS_NAME
