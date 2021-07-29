#!/bin/bash
set -e

RESOURCE_GROUP=$1
IMAGE_VERSION=$2
ENV=$3
SINGLE_APP_SVC_PLAN=$4

function createApp() {
  role=$1
  plan=$2
  # create web app
  az webapp create --name "$ENV$role-as-mtc-guytest" --resource-group $RESOURCE_GROUP \
    --deployment-container-image-name "mtc-$role:$IMAGE_VERSION" --plan $plan
}

if [ -z "$SINGLE_APP_SVC_PLAN" ]
then
  echo "TODO:create an app service plan for each app"
fi

createApp pupil $SINGLE_APP_SVC_PLAN
createApp auth $SINGLE_APP_SVC_PLAN
createApp admin $SINGLE_APP_SVC_PLAN
createApp assets $SINGLE_APP_SVC_PLAN


