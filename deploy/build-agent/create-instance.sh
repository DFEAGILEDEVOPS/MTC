#!/bin/bash
set -e

# Name of the build agent and Azure container instance
AGENT_NAME=$1
# Azure Resource Group
RESOURCE_GROUP=$2
# PAT token for the Azure DevOps organization
AZP_TOKEN=$3
# URL of the Azure DevOps organization
AZP_URL=$4
# name of the Azure Container Registry
ACR_NAME=$5
# username for the Azure Container Registry
ACR_USERNAME=$6
# password for the Azure Container Registry
ACR_PASSWORD=$7

# az acr login --name $ACR_NAME --resource-group $RESOURCE_GROUP

ACR_LOGIN_SERVER=$(az acr show --name $ACR_NAME --resource-group $RESOURCE_GROUP --query "loginServer" --output tsv)

az container create --resource-group $RESOURCE_GROUP --name $AGENT_NAME --output none \
  --cpu 4 --memory 8 \
  --image "$ACR_LOGIN_SERVER/devops-build-agent:latest" \
  --registry-login-server $ACR_LOGIN_SERVER \
  --registry-username $ACR_USERNAME \
  --registry-password $ACR_PASSWORD \
  --environment-variables AZP_TOKEN="$AZP_TOKEN" AZP_AGENT_NAME=$AGENT_NAME AZP_POOL=MTC AZP_URL=$AZP_URL
