#!/bin/bash

# set errors on
set -e

# takes function master key and updates key vault secret

if [ -z "$1" ]
  then
    echo "target resource group name required for $0"
    exit 1
fi

if [ -z "$2" ]
  then
    echo "target key vault name required for $0"
    exit 1
fi

if [ -z "$3" ]
  then
    echo "target secret name required for $0"
    exit 1
fi

if [ -z "$4" ]
  then
    echo "target function app name required for $0"
    exit 1
fi

# input parameters
RES_GROUP=$1 # target resource group
KEY_VAULT_NAME=$2 # key vault instance
TARGET_SECRET_NAME=$3 # name of target secret in key vault
FUNCTION_APP_NAME=$4 # function app instance

# https://learn.microsoft.com/en-us/cli/azure/functionapp/keys?view=azure-cli-latest#az-functionapp-keys-list
KEY_VALUE=$(az functionapp keys list -g $RES_GROUP -n $FUNCTION_APP_NAME --query masterKey | jq -r)

echo "Updating key vault secret with current master key..."

az keyvault secret set --vault-name $KEY_VAULT_NAME --name $TARGET_SECRET_NAME --value $KEY_VALUE  -o none
echo "secret updated for key vault $KEY_VAULT_NAME"
