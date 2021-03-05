#!/bin/bash

# renews key for service bus, storage account and redis

# input parameters
RES_GROUP=$1 # target resource group
KEY_VAULT_NAME=$2 # key vault instance
SERVICE_BUS_NAME=$3 # service bus instance
STORAGE_ACCOUNT_NAME=$4 # storage account
REDIS_NAME=$5 # redis instance
KEY_TYPE=$6 # accepted values are 'primary' or 'secondary'

# known values
SB_CONSUMER_KEY_NAME="mtc-consumer"
SB_OWNER_KEY_NAME="RootManageSharedAccessKey"
STORAGE_ACCOUNT_KEY_TYPE="" # valid values are 'primary', 'secondary'
SERVICE_BUS_KEY_TYPE="" # valid values are 'PrimaryKey', 'SecondaryKey'
REDIS_KEY_TYPE="" # valid valuees are 'Primary', 'Secondary'

# Azure CLI uses slightly different identifiers for key type across different services :-/
# align them for each service...
if [ "$KEY_TYPE" = "primary" ]
then
  # set keys to primary
  STORAGE_ACCOUNT_KEY_TYPE="primary"
  SERVICE_BUS_KEY_TYPE="PrimaryKey"
  REDIS_KEY_TYPE="Primary"

elif [ "$KEY_TYPE" = "secondary" ]
then
  # set keys to secondary
  STORAGE_ACCOUNT_KEY_TYPE="secondary"
  SERVICE_BUS_KEY_TYPE="SecondaryKey"
  REDIS_KEY_TYPE="Secondary"

else
  # throw error
  echo "ERROR: KEY_TYPE not specified.  valid values are 'primary' or 'secondary'"
  exit 1

fi

# rotate key for storage account
# https://docs.microsoft.com/en-us/cli/azure/storage/account/keys?view=azure-cli-latest#az_storage_account_keys_renew
# output
# [
#   {
#     "keyName": "key1",
#     "permissions": "...",
#     "value": "..."
#   },
#   {
#     "keyName": "key2",
#     "permissions": "...",
#     "value": "..."
#   }
# ]
echo "renewing $STORAGE_ACCOUNT_KEY_TYPE key for storage account $STORAGE_ACCOUNT_NAME..."
# TODO capture output and parse with jg into var
az storage account keys renew --resource-group $RES_GROUP --account-name $STORAGE_ACCOUNT_NAME --key $STORAGE_ACCOUNT_KEY_TYPE

# rotate key for service bus (consumer)
# https://docs.microsoft.com/en-us/cli/azure/servicebus/namespace/authorization-rule/keys?view=azure-cli-latest#az_servicebus_namespace_authorization_rule_keys_renew
# output
# {
#   "aliasPrimaryConnectionString": null,
#   "aliasSecondaryConnectionString": null,
#   "keyName": "...",
#   "primaryConnectionString": "...",
#   "primaryKey": "...",
#   "secondaryConnectionString": "...",
#   "secondaryKey": "..."
# }
echo "renewing $SERVICE_BUS_KEY_TYPE key for user $SB_CONSUMER_KEY_NAME service bus namespace $SERVICE_BUS_NAME..."
# TODO capture output and parse with jq into var
az servicebus namespace authorization-rule keys renew --key $SERVICE_BUS_KEY_TYPE --name $SB_CONSUMER_KEY_NAME --namespace-name $SERVICE_BUS_NAME --resource-group $RES_GROUP

# rotate key for service bus (owner)
# https://docs.microsoft.com/en-us/cli/azure/servicebus/namespace/authorization-rule/keys?view=azure-cli-latest#az_servicebus_namespace_authorization_rule_keys_renew
echo "renewing $SERVICE_BUS_KEY_TYPE key for user $SB_OWNER_KEY_NAME service bus namespace $SERVICE_BUS_NAME..."
az servicebus namespace authorization-rule keys renew --key $SERVICE_BUS_KEY_TYPE --name $SB_OWNER_KEY_NAME --namespace-name $SERVICE_BUS_NAME --resource-group $RES_GROUP

# rotate key for redis
# https://docs.microsoft.com/en-us/cli/azure/redis?view=azure-cli-latest#az_redis_regenerate_keys
# output
# {
#   "primaryKey": "...",
#   "secondaryKey": "..."
# }
echo "renewing $REDIS_KEY_TYPE key for redis instance $REDIS_NAME..."
az redis regenerate-keys --key-type $REDIS_KEY_TYPE --name $REDIS_NAME --resource-group $RES_GROUP


exit 0
## update key vault values

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
