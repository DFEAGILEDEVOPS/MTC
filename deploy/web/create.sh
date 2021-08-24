#!/bin/bash
set -e

RES_GRP=$1
ENV=$2
SUFFIX=$3
SKU=$4
SINGLE_APP_SVC_PLAN=$5

# the web app name variables
ADMIN_SITE_NAME="${ENV}admin-as-$SUFFIX"
ASSETS_SITE_NAME="${ENV}assets-as-$SUFFIX"
AUTH_SITE_NAME="${ENV}auth-as-$SUFFIX"
PUPIL_SITE_NAME="${ENV}pupil-as-$SUFFIX"

function createApp() {
  role=$1
  siteName=$2
  plan=$3
  echo "creating web app $siteName under app service plan $plan"
  # TODO for future ref, when using container registry...
  # https://docs.microsoft.com/en-us/azure/app-service/tutorial-custom-container?pivots=container-linux
  az webapp create -o none -n $siteName -g $RES_GRP \
    --deployment-container-image-name "DOCKER|nginxdemos/hello:latest" --plan $plan
}

function createAppServicePlan() {
  role=$1
  aspName="${ENV}${role}-asp-$SUFFIX"
  echo "creating app service plan $aspName"
  az appservice plan create -o none -n $aspName -g $RES_GRP \
    --is-linux --sku $SKU
}

AUTH_SVC_PLAN_NAME="${ENV}auth-asp-$SUFFIX"
ADMIN_SVC_PLAN_NAME="${ENV}admin-asp-$SUFFIX"
ASSETS_SVC_PLAN_NAME="${ENV}assets-asp-$SUFFIX"
PUPIL_SVC_PLAN_NAME="${ENV}pupil-asp-$SUFFIX"

if [ -z "$SINGLE_APP_SVC_PLAN" ]
then
  createAppServicePlan auth
  createAppServicePlan admin
  createAppServicePlan assets
  createAppServicePlan pupil
else
  ADMIN_SVC_PLAN_NAME=$SINGLE_APP_SVC_PLAN
  ASSETS_SVC_PLAN_NAME=$SINGLE_APP_SVC_PLAN
  AUTH_SVC_PLAN_NAME=$SINGLE_APP_SVC_PLAN
  PUPIL_SVC_PLAN_NAME=$SINGLE_APP_SVC_PLAN
fi

createApp admin $ADMIN_SITE_NAME $ADMIN_SVC_PLAN_NAME
createApp assets $ASSETS_SITE_NAME $ASSETS_SVC_PLAN_NAME
createApp auth $AUTH_SITE_NAME $AUTH_SVC_PLAN_NAME
createApp pupil $PUPIL_SITE_NAME $PUPIL_SVC_PLAN_NAME

# apply default site settings
for webAppName in $ADMIN_SITE_NAME $ASSETS_SITE_NAME $AUTH_SITE_NAME $PUPIL_SITE_NAME
do
  echo "applying security config for $webAppName"
  az webapp config set -o none -g $RES_GRP -n $webAppName --always-on true \
    --ftps-state Disabled --http20-enabled true --min-tls-version '1.2' \
    --remote-debugging-enabled false --web-sockets-enabled false
  az webapp update -o none -g $RES_GRP -n $webAppName --https-only true --client-affinity-enabled false
  # assign system identity
  az webapp identity assign -o none -g $RES_GRP -n $webAppName
done
