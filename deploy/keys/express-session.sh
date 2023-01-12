#!/bin/bash

# set errors on
set -e

# renews express session secret

# input parameters
KEY_VAULT_NAME=$1
SECRET_LENGTH=${2:-48}  # secret length, defaults to 48

SECRET_VALUE=$(LC_ALL=C tr -dc A-Za-z0-9 </dev/urandom | head -c $SECRET_LENGTH ; echo '')

SECRET_NAME=ExpressSessionSecret

az keyvault secret set --vault-name $KEY_VAULT_NAME --name $SECRET_NAME --value $SECRET_VALUE  -o none
echo "$SECRET_NAME updated in Key Vault"
