#!/bin/bash

# set errors on
set -e

# renews key for service bus and updates key vault

# input parameters
RES_GROUP=$1 # target resource group
KEY_VAULT_NAME=$2 # key vault instance
SERVICE_BUS_NAME=$3 # service bus instance
KEY_TYPE=$4 # accepted values are 'primary' or 'secondary'
SERVICE_BUS_USER=$5 # the target user for key rotation
UPDATE_KV_SECRET="${6:-false}"  # skips the key vault update if true

SERVICE_BUS_KEY_TYPE="" # valid values are 'PrimaryKey', 'SecondaryKey'
KEY_IDENTIFIER="" # valid valuees are 'primaryConnectionString', 'secondaryConnectionString'

# Azure CLI uses slightly different identifiers for key type across different services :-/
# align them for each service...
if [ "$KEY_TYPE" = "primary" ]
then
  # set keys to primary
  SERVICE_BUS_KEY_TYPE="PrimaryKey"
  KEY_IDENTIFIER="primaryConnectionString"
elif [ "$KEY_TYPE" = "secondary" ]
then
  # set keys to secondary
  SERVICE_BUS_KEY_TYPE="SecondaryKey"
  KEY_IDENTIFIER="secondaryConnectionString"
else
  # throw error
  echo "ERROR: KEY_TYPE not specified.  valid values are 'primary' or 'secondary'"
  exit 1
fi

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
echo "renewing $SERVICE_BUS_KEY_TYPE key for user $SERVICE_BUS_USER in service bus namespace $SERVICE_BUS_NAME..."
KEY_VALUE=$(az servicebus namespace authorization-rule keys renew --key $SERVICE_BUS_KEY_TYPE --name $SERVICE_BUS_USER --namespace-name $SERVICE_BUS_NAME --resource-group $RES_GROUP | jq -r .$KEY_IDENTIFIER)

# skip key vault update if requested
if [ $UPDATE_KV_SECRET == "False" ]; then exit 0; fi

SERVICE_BUS_USER_KEY="ServiceBusConnectionString-$SERVICE_BUS_USER"
## update key vault values
az keyvault secret set --vault-name $KEY_VAULT_NAME --name $SERVICE_BUS_USER_KEY --value "$KEY_VALUE"  -o none
echo "$SERVICE_BUS_USER_KEY updated in key vault"
