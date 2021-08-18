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

AUTH_APP_SVC_PLAN_NAME="$ENV$auth-asp-$NAME_SUFFIX"
PUPIL_APP_SVC_PLAN_NAME="$ENV$pupil-asp-$NAME_SUFFIX"
ADMIN_APP_SVC_PLAN_NAME="$ENV$admin-asp-$NAME_SUFFIX"
ASSETS_APP_SVC_PLAN_NAME="$ENV$assets-asp-$NAME_SUFFIX"

if [ -z "$SINGLE_APP_SVC_PLAN" ]
then
  createAppServicePlan pupil
  createAppServicePlan auth
  createAppServicePlan admin
  createAppServicePlan assets
else
  PUPIL_APP_SVC_PLAN_NAME=$SINGLE_APP_SVC_PLAN
  AUTH_APP_SVC_PLAN_NAME=$SINGLE_APP_SVC_PLAN
  ADMIN_APP_SVC_PLAN_NAME=$SINGLE_APP_SVC_PLAN
  ASSETS_APP_SVC_PLAN_NAME=$SINGLE_APP_SVC_PLAN
fi

createApp pupil $PUPIL_APP_SVC_PLAN_NAME
createApp auth $AUTH_APP_SVC_PLAN_NAME
createApp admin $ADMIN_APP_SVC_PLAN_NAME
createApp assets $ASSETS_APP_SVC_PLAN_NAME

# az webapp config set --always-on true --ftps-state Disabled --http20-enabled true --min-tls-version '1.2' --remote-debugging-enabled false --web-sockets-enabled false

# disallow FTP
az resource update --resource-group $RESOURCE_GROUP --name ftp --namespace Microsoft.Web \
  --resource-type basicPublishingCredentialsPolicies --parent sites/$PUPIL_APP_SVC_PLAN_NAME --set properties.allow=false
az resource update --resource-group $RESOURCE_GROUP --name ftp --namespace Microsoft.Web \
  --resource-type basicPublishingCredentialsPolicies --parent sites/$AUTH_APP_SVC_PLAN_NAME --set properties.allow=false
az resource update --resource-group $RESOURCE_GROUP --name ftp --namespace Microsoft.Web \
  --resource-type basicPublishingCredentialsPolicies --parent sites/$ADMIN_APP_SVC_PLAN_NAME --set properties.allow=false
az resource update --resource-group $RESOURCE_GROUP --name ftp --namespace Microsoft.Web \
  --resource-type basicPublishingCredentialsPolicies --parent sites/$ASSETS_APP_SVC_PLAN_NAME --set properties.allow=false

# disable basic auth access to webdeploy port and SCM site
az resource update --resource-group $RESOURCE_GROUP --name scm --namespace Microsoft.Web \
  --resource-type basicPublishingCredentialsPolicies --parent sites/$PUPIL_APP_SVC_PLAN_NAME --set properties.allow=false
az resource update --resource-group $RESOURCE_GROUP --name scm --namespace Microsoft.Web \
  --resource-type basicPublishingCredentialsPolicies --parent sites/$AUTH_APP_SVC_PLAN_NAME --set properties.allow=false
az resource update --resource-group $RESOURCE_GROUP --name scm --namespace Microsoft.Web \
  --resource-type basicPublishingCredentialsPolicies --parent sites/$ADMIN_APP_SVC_PLAN_NAME --set properties.allow=false
az resource update --resource-group $RESOURCE_GROUP --name scm --namespace Microsoft.Web \
  --resource-type basicPublishingCredentialsPolicies --parent sites/$ASSETS_APP_SVC_PLAN_NAME --set properties.allow=false
