#!/bin/bash

# set errors on
set -e

# integration test for redis.sh, service-bus.sh and storage.sh

# test failure handler
fail()
{
  HASHLINE="#############################################################################################"
  echo $HASHLINE
  echo "Test Failure: $1" 1>&2
  echo $HASHLINE
  exit 1
}

# input parameters
RES_GROUP=$1 # target resource group
KEY_VAULT_NAME=$2 # key vault instance
SERVICE_BUS_NAME=$3 # service bus instance
STORAGE_ACCOUNT_NAME=$4 # storage account
REDIS_NAME=$5 # redis instance
SERVICE_BUS_USER=$6 # target user for service bus key

# 1. renew primary keys...
KEY_TYPE="primary"
source redis.sh $RES_GROUP $KEY_VAULT_NAME $REDIS_NAME $KEY_TYPE
source service-bus.sh $RES_GROUP $KEY_VAULT_NAME $SERVICE_BUS_NAME $KEY_TYPE $SERVICE_BUS_USER
source storage.sh $RES_GROUP $KEY_VAULT_NAME $STORAGE_ACCOUNT_NAME $KEY_TYPE

# 2. extract current values from key vault
echo "extracting current key vault values for comparison..."
REDIS_KEY_KV=$(az keyvault secret show --name "RedisKey" --vault-name $KEY_VAULT_NAME | jq -r .value)
STORAGE_KEY_KV=$(az keyvault secret show --name "StorageAccountKey" --vault-name $KEY_VAULT_NAME | jq -r .value)
STORAGE_CON_STRING_KV=$(az keyvault secret show --name "StorageAccountConnectionString" --vault-name $KEY_VAULT_NAME | jq -r .value)
SB_CON_STRING_KV=$(az keyvault secret show --name "ServiceBusConnectionString-$SERVICE_BUS_USER" --vault-name $KEY_VAULT_NAME | jq -r .value)

# 3. extract current values from each service
echo "extracting current $KEY_TYPE key values from azure services for comparison..."
REDIS_KEY_ACTUAL=$(az redis list-keys --name $REDIS_NAME --resource-group $RES_GROUP | jq -r .primaryKey)
STORAGE_KEY_ACTUAL=$(az storage account keys list -g $RES_GROUP -n $STORAGE_ACCOUNT_NAME | jq -r .[0].value)
STORAGE_CON_STRING_ACTUAL=$(az storage account show-connection-string -g $RES_GROUP -n $STORAGE_ACCOUNT_NAME | jq -r .connectionString)
SB_CON_STRING_ACTUAL=$(az servicebus namespace authorization-rule keys list --resource-group $RES_GROUP --namespace-name $SERVICE_BUS_NAME --name $SERVICE_BUS_USER | jq -r .primaryConnectionString)

# 4. compare values for equality
if [[ $REDIS_KEY_KV != $REDIS_KEY_ACTUAL ]];
then
  echo "Redis Primary Key in key vault does not match actual value"
  exit 1
fi

if [[ $STORAGE_KEY_KV != $STORAGE_KEY_ACTUAL ]];
then
  echo "Storage Account Primary Key in key vault does not match actual value"
  exit 1
fi

if [[ $STORAGE_CON_STRING_KV != $STORAGE_CON_STRING_ACTUAL ]];
then
  echo "Storage Account Primary Connection String in key vault does not match actual value"
  exit 1
fi

if [[ $SB_CON_STRING_KV != $SB_CON_STRING_ACTUAL ]];
then
  echo "Service Bus Connection String for $SERVICE_BUS_USER in key vault does not match actual value"
  exit 1
fi

echo "primary keys test successful."

# 1. renew secondary keys...
KEY_TYPE="secondary"
source redis.sh $RES_GROUP $KEY_VAULT_NAME $REDIS_NAME $KEY_TYPE
source service-bus.sh $RES_GROUP $KEY_VAULT_NAME $SERVICE_BUS_NAME $KEY_TYPE $SERVICE_BUS_USER
source storage.sh $RES_GROUP $KEY_VAULT_NAME $STORAGE_ACCOUNT_NAME $KEY_TYPE

# 2. extract current values from key vault
echo "extracting current key vault values for comparison..."
REDIS_KEY_KV=$(az keyvault secret show --name "RedisKey" --vault-name $KEY_VAULT_NAME | jq -r .value)
STORAGE_KEY_KV=$(az keyvault secret show --name "StorageAccountKey" --vault-name $KEY_VAULT_NAME | jq -r .value)
STORAGE_CON_STRING_KV=$(az keyvault secret show --name "StorageAccountConnectionString" --vault-name $KEY_VAULT_NAME | jq -r .value)
SB_CON_STRING_KV=$(az keyvault secret show --name "ServiceBusConnectionString-$SERVICE_BUS_USER" --vault-name $KEY_VAULT_NAME | jq -r .value)

# 3. extract current values from each service
echo "extracting current $KEY_TYPE service values for comparison..."
REDIS_KEY_ACTUAL=$(az redis list-keys --name $REDIS_NAME --resource-group $RES_GROUP | jq -r .secondaryKey)
STORAGE_KEY_ACTUAL=$(az storage account keys list --resource-group $RES_GROUP -n $STORAGE_ACCOUNT_NAME | jq -r .[1].value)
STORAGE_CON_STRING_ACTUAL=$(az storage account show-connection-string --resource-group $RES_GROUP -n $STORAGE_ACCOUNT_NAME --key secondary | jq -r .connectionString)
SB_CON_STRING_ACTUAL=$(az servicebus namespace authorization-rule keys list --resource-group $RES_GROUP --namespace-name $SERVICE_BUS_NAME --name $SERVICE_BUS_USER | jq -r .primaryConnectionString)

echo "comparing secondary keys..."
# 4. compare values for equality
if [[ $REDIS_KEY_KV != $REDIS_KEY_ACTUAL ]];
then
  echo "Redis Secondary Key in key vault does not match actual value"
  exit 1
fi

if [[ $STORAGE_KEY_KV != $STORAGE_KEY_ACTUAL ]];
then
  fail "Storage Account Secondary Key in key vault does not match actual value"
fi

if [[ $STORAGE_CON_STRING_KV != $STORAGE_CON_STRING_ACTUAL ]];
then
  echo "Storage Account Secondary Connection String in key vault does not match actual value"
  exit 1
fi

if [[ $SB_CON_STRING_KV != $SB_CON_STRING_ACTUAL ]];
then
  echo "Service Bus Connection String for $SERVICE_BUS_USER in key vault does not match actual value"
  exit 1
fi

echo "Secondary keys test successful"
