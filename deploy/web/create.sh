#!/bin/bash
set -e

RESOURCE_GROUP=$1
IMAGE_VERSION=$2
ENV=$3
SINGLE_APP_SVC_PLAN=$4
NAME_SUFFIX="mtc-guytest"

ADMIN_APP_SITE_NAME="$ENV-admin-as-$NAME_SUFFIX"
ASSETS_APP_SITE_NAME="$ENV-assets-as-$NAME_SUFFIX"
AUTH_APP_SITE_NAME="$ENV-auth-as-$NAME_SUFFIX"
PUPIL_APP_SITE_NAME="$ENV-pupil-as-$NAME_SUFFIX"

function createApp() {
  role=$1
  siteName=$2
  plan=$3
  echo "creating web app $siteName"
  az webapp create -o none -n $siteName -g $RESOURCE_GROUP \
    --deployment-container-image-name "mtc-$role:$IMAGE_VERSION" --plan $plan
}

function createAppServicePlan() {
  role=$1
  aspName="$ENV$role-asp-$NAME_SUFFIX"
  echo "creating app service plan $aspName"
  az appservice plan create -o none -n $aspName -g $RESOURCE_GROUP \
    --is-linux --sku S1
}

AUTH_APP_SVC_PLAN_NAME="$ENV$auth-asp-$NAME_SUFFIX"
ADMIN_APP_SVC_PLAN_NAME="$ENV$admin-asp-$NAME_SUFFIX"
ASSETS_APP_SVC_PLAN_NAME="$ENV$assets-asp-$NAME_SUFFIX"
PUPIL_APP_SVC_PLAN_NAME="$ENV$pupil-asp-$NAME_SUFFIX"

if [ -z "$SINGLE_APP_SVC_PLAN" ]
then
  createAppServicePlan auth
  createAppServicePlan admin
  createAppServicePlan assets
  createAppServicePlan pupil
else
  ADMIN_APP_SVC_PLAN_NAME=$SINGLE_APP_SVC_PLAN
  ASSETS_APP_SVC_PLAN_NAME=$SINGLE_APP_SVC_PLAN
  AUTH_APP_SVC_PLAN_NAME=$SINGLE_APP_SVC_PLAN
  PUPIL_APP_SVC_PLAN_NAME=$SINGLE_APP_SVC_PLAN
fi

createApp admin $ADMIN_APP_SITE_NAME $ADMIN_APP_SVC_PLAN_NAME
createApp assets $ASSETS_APP_SITE_NAME $ASSETS_APP_SVC_PLAN_NAME
createApp auth $AUTH_APP_SITE_NAME $AUTH_APP_SVC_PLAN_NAME
createApp pupil $PUPIL_APP_SITE_NAME $PUPIL_APP_SVC_PLAN_NAME

for webAppName in $ADMIN_APP_SITE_NAME $ASSETS_APP_SITE_NAME $AUTH_APP_SITE_NAME $PUPIL_APP_SITE_NAME
do
  echo "applying security config for $webAppName"
  az webapp config set -o none -g $RESOURCE_GROUP -n $webAppName --always-on true \
    --ftps-state Disabled --http20-enabled true --min-tls-version '1.2' \
    --remote-debugging-enabled false --web-sockets-enabled false
  az webapp update -o none -g $RESOURCE_GROUP -n $webAppName --https-only true --client-affinity-enabled false
done
