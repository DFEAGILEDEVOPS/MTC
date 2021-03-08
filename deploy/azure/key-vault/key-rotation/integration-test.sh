#!/bin/bash

# integration test for redis.sh, service-bus.sh and storage.sh

# input parameters
RES_GROUP=$1 # target resource group
KEY_VAULT_NAME=$2 # key vault instance
SERVICE_BUS_NAME=$3 # service bus instance
STORAGE_ACCOUNT_NAME=$4 # storage account
REDIS_NAME=$5 # redis instance
SERVICE_BUS_USER=$6 # target user for service bus key

# 1. renew primary keys...
KEY_TYPE="primary"
# source redis.sh $RES_GROUP $KEY_VAULT_NAME $REDIS_NAME $KEY_TYPE
# source service-bus.sh $RES_GROUP $KEY_VAULT_NAME $SERVICE_BUS_NAME $KEY_TYPE $SERVICE_BUS_USER
# source storage.sh $RES_GROUP $KEY_VAULT_NAME $STORAGE_ACCOUNT_NAME $KEY_TYPE

# 2. extract current values from key vault
REDIS_KEY_KV=$(az keyvault secret show --name "RedisKey" --vault-name $KEY_VAULT_NAME | jq -r .value)
STORAGE_KEY_KV=$(az keyvault secret show --name "StorageAccountKey" --vault-name $KEY_VAULT_NAME | jq -r .value)
STORAGE_CON_STRING_KV=$(az keyvault secret show --name "StorageAccountConnectionString" --vault-name $KEY_VAULT_NAME | jq -r .value)
SB_CON_STRING_KV=$(az keyvault secret show --name "ServiceBusConnectionString-$SERVICE_BUS_USER" --vault-name $KEY_VAULT_NAME | jq -r .value)

# 3. extract current values from each service
REDIS_KEY_ACTUAL=$(az redis list-keys --name $REDIS_NAME --resource-group $RES_GROUP | jq -r .primaryKey)
STORAGE_KEY_ACTUAL=$(az storage account keys list -g $RES_GROUP -n $STORAGE_ACCOUNT_NAME | jq -r .[0].value)
STORAGE_CON_STRING_ACTUAL=$(az storage account show-connection-string -g $RES_GROUP -n $STORAGE_ACCOUNT_NAME | jq -r .connectionString)
SB_CON_STRING_ACTUAL=$(az servicebus namespace authorization-rule keys list --resource-group $RES_GROUP --namespace-name $SERVICE_BUS_NAME --name $SERVICE_BUS_USER | jq -r .primaryConnectionString)

# 4. compare values for equality
if [ $REDIS_KEY_KV != $REDIS_KEY_ACTUAL]
  echo "Redis Primary Key in key vault does not match actual value"
  exit 1
fi

if [ $STORAGE_KEY_KV != $STORAGE_KEY_ACTUAL]
  echo "Storage Account Primary Key in key vault does not match actual value"
  exit 1
fi

if [ $STORAGE_CON_STRING_KV != $STORAGE_CON_STRING_ACTUAL]
  echo "Storage Account Primary Connection String in key vault does not match actual value"
  exit 1
fi

if [ $SB_CON_STRING_KV != $SB_CON_STRING_ACTUAL]
  echo "Service Bus Connection String for $SERVICE_BUS_USER in key vault does not match actual value"
  exit 1
fi

# 1. renew secondary keys...
KEY_TYPE="secondary"
# source redis.sh $RES_GROUP $KEY_VAULT_NAME $REDIS_NAME $KEY_TYPE
# source service-bus.sh $RES_GROUP $KEY_VAULT_NAME $SERVICE_BUS_NAME $KEY_TYPE $SERVICE_BUS_USER
# source storage.sh $RES_GROUP $KEY_VAULT_NAME $STORAGE_ACCOUNT_NAME $KEY_TYPE

# 2. extract current values from key vault
REDIS_KEY_KV=$(az keyvault secret show --name "RedisKey" --vault-name $KEY_VAULT_NAME | jq -r .value)
STORAGE_KEY_KV=$(az keyvault secret show --name "StorageAccountKey" --vault-name $KEY_VAULT_NAME | jq -r .value)
STORAGE_CON_STRING_KV=$(az keyvault secret show --name "StorageAccountConnectionString" --vault-name $KEY_VAULT_NAME | jq -r .value)
SB_CON_STRING_KV=$(az keyvault secret show --name "ServiceBusConnectionString-$SERVICE_BUS_USER" --vault-name $KEY_VAULT_NAME | jq -r .value)

# 3. extract current values from each service
REDIS_KEY_ACTUAL=$(az redis list-keys --name $REDIS_NAME --resource-group $RES_GROUP | jq -r .secondaryKey)
STORAGE_KEY_ACTUAL=$(az storage account keys list --resource-group $RES_GROUP --nanme $STORAGE_ACCOUNT_NAME | jq -r .[1].value)
STORAGE_CON_STRING_ACTUAL=$(az storage account show-connection-string --resource-group $RES_GROUP --name $STORAGE_ACCOUNT_NAME --key secondary | jq -r .connectionString)
SB_CON_STRING_ACTUAL=$(az servicebus namespace authorization-rule keys list --resource-group $RES_GROUP --namespace-name $SERVICE_BUS_NAME --name $SERVICE_BUS_USER | jq -r .primaryConnectionString)

# 4. compare values for equality
if [ $REDIS_KEY_KV != $REDIS_KEY_ACTUAL]
  echo "Redis Secondary Key in key vault does not match actual value"
  exit 1
fi

if [ $STORAGE_KEY_KV != $STORAGE_KEY_ACTUAL]
  echo "Storage Account Secondary Key in key vault does not match actual value"
  exit 1
fi

if [ $STORAGE_CON_STRING_KV != $STORAGE_CON_STRING_ACTUAL]
  echo "Storage Account Secondary Connection String in key vault does not match actual value"
  exit 1
fi

if [ $SB_CON_STRING_KV != $SB_CON_STRING_ACTUAL]
  echo "Service Bus Connection String for $SERVICE_BUS_USER in key vault does not match actual value"
  exit 1
fi

# temp for debug
echo "## KEY VAULT ##"
echo "redis: $REDIS_KEY_KV"
echo "storage key: $STORAGE_KEY_KV"
echo "storage connection: $STORAGE_CON_STRING_KV"
echo "service bus connection: $SB_CON_STRING_KV"
echo "## ACTUAL ##"
echo "redis: $REDIS_KEY_ACTUAL"
echo "storage key: $STORAGE_KEY_ACTUAL"
echo "storage connection: $STORAGE_CON_STRING_ACTUAL"
echo "service bus connection: $SB_CON_STRING_ACTUAL"
exit 0


