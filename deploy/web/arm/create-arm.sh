#!/bin/bash
set -e

RESOURCE_GROUP=$1
WEB_APP_NAME=$2
APP_SERVICE_PLAN_NAME=$3

templateFile="./autogen.webapp.arm.json"
az deployment group create \
  --name "create-test-web-app-from-autogen-template" \
  --resource-group $RESOURCE_GROUP \
  --template-file $templateFile \
  --parameters siteName=$WEB_APP_NAME appServicePlanName=$APP_SERVICE_PLAN_NAME
