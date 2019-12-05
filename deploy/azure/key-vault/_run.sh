#!/bin/bash

RES_GROUP=$1 # the target resource group
KEY_VAULT_NAME=$2 # the key vault name
SERVICE_BUS_NAME=$3 # the service bus to extract keys from
STORAGE_ACCOUNT_NAME=$4 # the storage account to extract keys from

### Service Bus
# get connection string for consumer apps...
SB_CONSUMER_CONNECTION_STRING=$(az servicebus namespace authorization-rule keys list --resource-group $RES_GROUP --namespace-name $SERVICE_BUS_NAME --name mtc-consumer | jq -r .primaryConnectionString)
# put it in key vault...
az keyvault secret set --vault-name $KEY_VAULT_NAME --name "ServiceBusConnectionString" --value "$SB_CONSUMER_CONNECTION_STRING"

  # get connection string for consumer apps...
SB_DEPLOY_CONNECTION_STRING=$(az servicebus namespace authorization-rule keys list --resource-group $RES_GROUP --namespace-name $SERVICE_BUS_NAME --name RootManageSharedAccessKey | jq -r .primaryConnectionString)
# put it in key vault...
az keyvault secret set --vault-name $KEY_VAULT_NAME --name "ServiceBusConnectionString-Deploy" --value "$SB_DEPLOY_CONNECTION_STRING"

### Storage Account
SA_CONNECTION_STRING=$(az storage account show-connection-string -g $RES_GROUP -n $STORAGE_ACCOUNT_NAME | jq -r .connectionString)
# put it in key vault...
az keyvault secret set --vault-name $KEY_VAULT_NAME --name "StorageAccountConnectionString" --value "$SA_CONNECTION_STRING"
