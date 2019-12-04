#!/bin/bash

BUS_NAME=$1 # corresponds to *.params.json file prefix, such as dev, preprod, demo etc
RES_GROUP=$2 # the target resource group
KEY_VAULT_NAME=$3 # the resource group key vault name

# az group deployment create --resource-group $RES_GROUP --template-file template.json --parameters bus_namespace=$BUS_NAME

# get connection string for consumer apps...
CONSUMER_CONNECTION_STRING=$(az servicebus namespace authorization-rule keys list --resource-group $RES_GROUP --namespace-name $BUS_NAME --name mtc-consumer | jq -r .primaryConnectionString)

# put it in key vault...
az keyvault secret set --vault-name $KEY_VAULT_NAME --name "ServiceBusConnectionString" --value "$CONSUMER_CONNECTION_STRING"

  # get connection string for consumer apps...
DEPLOY_CONNECTION_STRING=$(az servicebus namespace authorization-rule keys list --resource-group $RES_GROUP --namespace-name $BUS_NAME --name mtc-deploy | jq -r .primaryConnectionString)

# put it in key vault...
az keyvault secret set --vault-name $KEY_VAULT_NAME --name "ServiceBusConnectionString-Deploy" --value "$DEPLOY_CONNECTION_STRING"
