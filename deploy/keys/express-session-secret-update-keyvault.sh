#!/bin/bash

# set errors on
set -e

# renews express session secret

# input parameters
KEY_VAULT_NAME=$1
UPDATE_KV_SECRET="${2:-false}"  # skips the key vault update if true

SECRET_LENGTH=48
SECRET_VALUE=$(LC_ALL=C tr -dc A-Za-z0-9 </dev/urandom | head -c $SECRET_LENGTH ; echo '')
SECRET_NAME=ExpressSessionSecret

# skip key vault update if requested
if [ $UPDATE_KV_SECRET == "False" ]; then exit 0; fi

az keyvault secret set --vault-name $KEY_VAULT_NAME --name $SECRET_NAME --value $SECRET_VALUE  -o none
echo "$SECRET_NAME updated in Key Vault"
