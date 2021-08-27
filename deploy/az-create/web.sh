#!/bin/bash
set -e

RES_GRP=$1
ENV=$2
SUFFIX=$3
SKU=$4
APP_INSIGHTS=$5

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

  # https://docs.microsoft.com/en-us/cli/azure/webapp?view=azure-cli-latest#az_webapp_create
  az webapp create -o none -n $siteName -g $RES_GRP \
    --deployment-container-image-name "DOCKER|nginxdemos/hello:latest" --plan $plan

  if [ -n "$APP_INSIGHTS" ]; then
    # configure app insights
    # requires Azure CLI 2.0.79 or above to work
    # https://docs.microsoft.com/en-us/cli/azure/monitor/app-insights?view=azure-cli-latest
    az extension add --name application-insights
    INSTRUMENTATION_KEY=$(az monitor app-insights component show --app $APP_INSIGHTS --resource-group $RES_GRP --query  "instrumentationKey" --output json | tr -d '"')
    echo "configuring application insights instance $APP_INSIGHTS for $siteName"
    az webapp config appsettings set -o none -n $siteName -g $RES_GRP --settings APPINSIGHTS_INSTRUMENTATIONKEY=$INSTRUMENTATION_KEY
  fi

}

function createAppServicePlan() {
  aspName=$1
  echo "creating app service plan $aspName"
  # https://docs.microsoft.com/en-us/cli/azure/appservice/plan?view=azure-cli-latest#az_appservice_plan_create
  az appservice plan create -o none -n $aspName -g $RES_GRP \
    --is-linux --sku $SKU
}


AUTH_SVC_PLAN_NAME="${ENV}auth-asp-$SUFFIX"
ADMIN_SVC_PLAN_NAME="${ENV}admin-asp-$SUFFIX"
ASSETS_SVC_PLAN_NAME="${ENV}assets-asp-$SUFFIX"
PUPIL_SVC_PLAN_NAME="${ENV}pupil-asp-$SUFFIX"

createAppServicePlan $AUTH_SVC_PLAN_NAME
createAppServicePlan $ADMIN_SVC_PLAN_NAME
createAppServicePlan $ASSETS_SVC_PLAN_NAME
createAppServicePlan $PUPIL_SVC_PLAN_NAME

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
