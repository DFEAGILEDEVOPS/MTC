#!/bin/bash
set -e

RESOURCE_GROUP=$1
IMAGE_VERSION=$2
ENV=$3
SINGLE_APP_SVC_PLAN=$4
NAME_SUFFIX="mtc-guytest"

function createApp() {
  role=$1
  plan=$2
  # create web app
  az webapp create --name "$ENV$role-as-$NAME_SUFFIX" --resource-group $RESOURCE_GROUP \
    --deployment-container-image-name "mtc-$role:$IMAGE_VERSION" --plan $plan
}

function createAppServicePlan() {
  role=$1
  az appservice plan create --name "$ENV$role-asp-$NAME_SUFFIX" --resource-group $RESOURCE_GROUP \
    --is-linux --sku S1
}

$AUTH_APP_SVC_PLAN_NAME="$ENV$auth-asp-$NAME_SUFFIX"
$PUPIL_APP_SVC_PLAN_NAME="$ENV$pupil-asp-$NAME_SUFFIX"
$ADMIN_APP_SVC_PLAN_NAME="$ENV$admin-asp-$NAME_SUFFIX"
$ASSETS_APP_SVC_PLAN_NAME="$ENV$assets-asp-$NAME_SUFFIX"

if [ -z "$SINGLE_APP_SVC_PLAN" ]
then
  createAppServicePlan pupil
  createAppServicePlan auth
  createAppServicePlan admin
  createAppServicePlan assets
else
  $PUPIL_APP_SVC_PLAN_NAME=$SINGLE_APP_SVC_PLAN
  $AUTH_APP_SVC_PLAN_NAME=$SINGLE_APP_SVC_PLAN
  $ADMIN_APP_SVC_PLAN_NAME=$SINGLE_APP_SVC_PLAN
  $ASSETS_APP_SVC_PLAN_NAME=$SINGLE_APP_SVC_PLAN
fi

createApp pupil $PUPIL_APP_SVC_PLAN_NAME
createApp auth $AUTH_APP_SVC_PLAN_NAME
createApp admin $ADMIN_APP_SVC_PLAN_NAME
createApp assets $ASSETS_APP_SVC_PLAN_NAME


