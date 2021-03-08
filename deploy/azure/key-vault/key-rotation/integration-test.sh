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
source redis.sh $RES_GROUP $KEY_VAULT_NAME $REDIS_NAME $KEY_TYPE
source service-bus.sh $RES_GROUP $KEY_VAULT_NAME $SERVICE_BUS_NAME $KEY_TYPE $SERVICE_BUS_USER
source storage.sh $RES_GROUP $KEY_VAULT_NAME $STORAGE_ACCOUNT_NAME $KEY_TYPE

# 2. extract current values from key vault
REDIS_KEY_KV=$(az keyvault secret show --name "RedisKey" --vault-name $KEY_VAULT_NAME | jq -r .value)
STORAGE_KEY_KV=$(az keyvault secret show --name "StorageAccountKey" --vault-name $KEY_VAULT_NAME | jq -r .value)
STORAGE_CON_STRING_KV=$(az keyvault secret show --name "StorageAccountConnectionString" --vault-name $KEY_VAULT_NAME | jq -r .value)
SB_CON_STRING_KV=$(az keyvault secret show --name "ServiceBusConnectionString-$SERVICE_BUS_USER" --vault-name $KEY_VAULT_NAME | jq -r .value)

# temp for debug
echo "redis: $REDIS_KEY_KV"
echo "storage key: $STORAGE_KEY_KV"
echo "storage connection: $STORAGE_CON_STRING_KV"
echo "service bus connection: $SB_CON_STRING_KV"
exit 0


