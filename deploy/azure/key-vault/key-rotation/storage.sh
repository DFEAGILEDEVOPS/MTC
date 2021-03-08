#!/bin/bash

# renews key for service bus, storage account and redis

# input parameters
RES_GROUP=$1 # target resource group
KEY_VAULT_NAME=$2 # key vault instance
STORAGE_ACCOUNT_NAME=$3 # storage account
KEY_TYPE=$4 # accepted values are 'primary' or 'secondary'

STORAGE_ACCOUNT_KEY_TYPE="" # valid values are 'primary', 'secondary'
KEY_IDENTIFIER="" # as its an array, key1 is '0' and key2 is '1'

# Azure CLI uses slightly different identifiers for key type across different services :-/
# align them for each service...
if [ "$KEY_TYPE" = "primary" ]
then
  # set keys to primary
  STORAGE_ACCOUNT_KEY_TYPE="primary"

elif [ "$KEY_TYPE" = "secondary" ]
then
  # set keys to secondary
  STORAGE_ACCOUNT_KEY_TYPE="secondary"

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

JSON_OUTPUT=$(az storage account keys renew --resource-group $RES_GROUP --account-name $STORAGE_ACCOUNT_NAME --key $STORAGE_ACCOUNT_KEY_TYPE)
ACCOUNT_KEY=$(echo $JSON_OUTPUT | jq '.[0] | .value')
CONNECTION_STRING=$(az storage account show-connection-string -g $RES_GROUP -n $STORAGE_ACCOUNT_NAME | jq -r .connectionString)

# update key vault connection string
az keyvault secret set --vault-name $KEY_VAULT_NAME --name "StorageAccountConnectionString" --value "$CONNECTION_STRING"
## update key vault account key
az keyvault secret set --vault-name $KEY_VAULT_NAME --name "StorageAccountKey" --value $ACCOUNT_KEY
