#!/bin/bash

# obtains secret values for service bus and storage accounts, and updates the relevant key vault secret value.
# Limitations
# -----------
# Service Bus auth rule names are hardcoded

echo "this script should not be used as limited by only supporting the primary keys" >&2
exit -1

RES_GROUP=$1 # the target resource group
KEY_VAULT_NAME=$2 # the key vault name
SERVICE_BUS_NAME=$3 # the service bus to extract keys from
STORAGE_ACCOUNT_NAME=$4 # the storage account to extract keys from
REDIS_INSTANCE_NAME=$5 # the redis instance to obtain key vbalue from

### Service Bus
# get connection string for consumer apps...
SB_CONSUMER_CONNECTION_STRING=$(az servicebus namespace authorization-rule keys list --resource-group $RES_GROUP --namespace-name $SERVICE_BUS_NAME --name mtc-consumer | jq -r .primaryConnectionString)
# put it in key vault...
az keyvault secret set --vault-name $KEY_VAULT_NAME --name "ServiceBusConnectionString" --value "$SB_CONSUMER_CONNECTION_STRING" -o none

  # get connection string for consumer apps...
SB_DEPLOY_CONNECTION_STRING=$(az servicebus namespace authorization-rule keys list --resource-group $RES_GROUP --namespace-name $SERVICE_BUS_NAME --name mtc-deploy | jq -r .primaryConnectionString)
# put it in key vault...
az keyvault secret set --vault-name $KEY_VAULT_NAME --name "ServiceBusConnectionString-Deploy" --value "$SB_DEPLOY_CONNECTION_STRING" -o none

### Storage Account
SA_CONNECTION_STRING=$(az storage account show-connection-string -g $RES_GROUP -n $STORAGE_ACCOUNT_NAME | jq -r .connectionString)
# put it in key vault...
az keyvault secret set --vault-name $KEY_VAULT_NAME --name "StorageAccountConnectionString" --value "$SA_CONNECTION_STRING" -o none

SA_KEY_VALUE=$(az storage account keys list --account-name $STORAGE_ACCOUNT_NAME | jq -r .[0].value)
# put it in key vault...
az keyvault secret set --vault-name $KEY_VAULT_NAME --name "StorageAccountKey" --value "$SA_KEY_VALUE" -o none

### Redis
REDIS_KEY_VALUE=$(az redis list-keys -n $REDIS_INSTANCE_NAME -g $RES_GROUP | jq -r .primaryKey)
# put it in key vault...
az keyvault secret set --vault-name $KEY_VAULT_NAME --name "RedisKey" --value "$REDIS_KEY_VALUE" -o none
