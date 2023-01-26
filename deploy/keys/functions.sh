#!/bin/bash

# set errors on
set -e

echo "currently unable to update master key via CLI"
return -1

# renews key for azure redis and updates key vault

# input parameters
RES_GROUP=$1 # target resource group
KEY_VAULT_NAME=$2 # key vault instance
FUNCTION_APP_NAME=$3 # function app instance
UPDATE_KV_SECRET="${5:-false}" # updates the key vault secret if true

# https://learn.microsoft.com/en-us/cli/azure/functionapp/keys?view=azure-cli-latest#az-functionapp-keys-set
az functionapp keys set -g $RES_GROUP -n $FUNCTION_APP_NAME --key-type masterKey

# skip key vault update if requested
if [ $UPDATE_KV_SECRET == "False" ]; then exit 0; fi
echo "UPDATE_KV_SECRET set to $UPDATE_KV_SECRET. Updating key vault secret..."

## update key vault value...
az keyvault secret set --vault-name $KEY_VAULT_NAME --name "TODO" --value $KEY_VALUE  -o none
echo "secret updated for key vault $KEY_VAULT_NAME"
