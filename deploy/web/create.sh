#!/bin/bash
set -e

RESOURCE_GROUP=$1
APP_NAME=$2
APP_SVC_PLAN=$3
IMAGE_NAME=$4
IMAGE_VERSION=$5
#DOCKER_USER=$6
#DOCKER_PASSWORD=$7

az webapp create --name $APP_NAME --resource-group $RESOURCE_GROUP \
  --deployment-container-image-name "$IMAGE_NAME:$IMAGE_VERSION" --plan $APP_SVC_PLAN
