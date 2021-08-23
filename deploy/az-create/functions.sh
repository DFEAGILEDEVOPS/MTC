#!/bin/bash
set -e

RES_GRP=$1
LOCATION=$2
ENV=$3
SUFFIX=$4
STORAGE_ACCOUNT=$5
APP_INSIGHTS_NAME=$6

NAME="$ENV-func-1-$SUFFIX"

echo "creating function app $NAME"
az functionapp create -o none -n $NAME -g $RES_GRP --functions-version 3 --runtime node --runtime-version 12 \
  --storage-account $STORAGE_ACCOUNT --app-insights $APP_INSIGHTS_NAME

NAME="$ENV-func-2-$SUFFIX"

echo "creating function app $NAME"
az functionapp create -o none -n $NAME -g $RES_GRP --functions-version 3 --runtime node --runtime-version 12 \
  --storage-account $STORAGE_ACCOUNT --app-insights $APP_INSIGHTS_NAME
