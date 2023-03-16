#!/bin/bash

# set errors on
set -e

# renews key for storage account and updates key vault

# input parameters
RES_GROUP=$1 # target resource group
KEY_VAULT_NAME=$2 # key vault instance
STORAGE_ACCOUNT_NAME=$3 # storage account
KEY_TYPE=$4 # accepted values are 'primary' or 'secondary'
UPDATE_KV_SECRET="${5:-false}"  # skips the key vault update if true

STORAGE_ACCOUNT_KEY_TYPE="" # valid values are 'key1', 'key2'

# Azure CLI uses slightly different identifiers for key type across different services :-/
# align them for each service...
if [ "$KEY_TYPE" = "primary" ]
then
  # set keys to primary
  STORAGE_ACCOUNT_KEY_TYPE="key1"

elif [ "$KEY_TYPE" = "secondary" ]
then
  # set keys to secondary
  STORAGE_ACCOUNT_KEY_TYPE="key2"

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
if [ "$KEY_TYPE" = "primary" ]
then
  ACCOUNT_KEY=$(echo $JSON_OUTPUT | jq -r '.[0] | .value')
else
  ACCOUNT_KEY=$(echo $JSON_OUTPUT | jq -r '.[1] | .value')
fi

CONNECTION_STRING=$(az storage account show-connection-string -g $RES_GROUP -n $STORAGE_ACCOUNT_NAME --key $STORAGE_ACCOUNT_KEY_TYPE | jq -r .connectionString)

# skip key vault update if requested
if [ $UPDATE_KV_SECRET == "False" ]; then exit 0; fi

# update key vault connection string
az keyvault secret set --vault-name $KEY_VAULT_NAME --name "StorageAccountConnectionString" --value "$CONNECTION_STRING"  -o none
echo "StorageAccountConnectionString updated in Key Vault"
## update key vault account key
az keyvault secret set --vault-name $KEY_VAULT_NAME --name "StorageAccountKey" --value $ACCOUNT_KEY  -o none
echo "StorageAccountKey updated in Key Vault"
