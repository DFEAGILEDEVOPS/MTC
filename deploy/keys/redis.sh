#!/bin/bash

# set errors on
set -e

# renews key for azure redis and updates key vault

# input parameters
RES_GROUP=$1 # target resource group
KEY_VAULT_NAME=$2 # key vault instance
REDIS_NAME=$3 # redis instance
KEY_TYPE=$4 # accepted values are 'primary' or 'secondary'
SKIP_KV_UPDATE="${5:-false}" # skips the key vault update if true

REDIS_KEY_TYPE="" # valid values are 'Primary', 'Secondary'
KEY_IDENTIFIER="" # valid values are 'primaryKey', 'secondaryKey'

# Azure CLI uses slightly different identifiers for key type across different services :-/
# align them for each service...
if [ "$KEY_TYPE" = "primary" ]
then
  # set keys to primary
  REDIS_KEY_TYPE="Primary"
  KEY_IDENTIFIER="primaryKey"
elif [ "$KEY_TYPE" = "secondary" ]
then
  # set keys to secondary
  REDIS_KEY_TYPE="Secondary"
  KEY_IDENTIFIER="secondaryKey"
else
  # throw error
  echo "ERROR: KEY_TYPE not specified.  valid values are 'primary' or 'secondary'"
  exit 1
fi

# rotate key for redis
# https://docs.microsoft.com/en-us/cli/azure/redis?view=azure-cli-latest#az_redis_regenerate_keys
# output
# {
#   "primaryKey": "...",
#   "secondaryKey": "..."
# }
echo "renewing $REDIS_KEY_TYPE key for redis instance $REDIS_NAME..."
KEY_VALUE=$(az redis regenerate-keys --key-type $REDIS_KEY_TYPE --name $REDIS_NAME --resource-group $RES_GROUP | jq -r .$KEY_IDENTIFIER)

echo "flag for kv update is $SKIP_KV_UPDATE"
# skip key vault update if requested
if [ $SKIP_KV_UPDATE == true ]; then exit 0; fi

## update key vault value...
az keyvault secret set --vault-name $KEY_VAULT_NAME --name "RedisKey" --value $KEY_VALUE  -o none
echo "RedisKey secret updated for key vault $KEY_VAULT_NAME"
