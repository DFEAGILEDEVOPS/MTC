#!/bin/bash
set -e

if [ -z "$1" ]
  then
    echo "azure key vault instance name required"
    exit 1
fi

if [ -z "$2" ]
  then
    echo "azure resource group name required"
    exit 1
fi

if [ -z "$3" ]
  then
    echo "at least 1 ip address required"
    exit 1
fi

KEY_VAULT_NAME=$1
RES_GRP=$2
IP_ADDRESS=$3
az keyvault network-rule add --name $KEY_VAULT_NAME --resource-group $RES_GRP --ip-address $IP_ADDRESS

if [ -z "$4" ]
then
  exit 0

az keyvault network-rule add --name $KEY_VAULT_NAME --resource-group $RES_GRP --ip-address $4

if [ -z "$5" ]
then
  exit 0

az keyvault network-rule add --name $KEY_VAULT_NAME --resource-group $RES_GRP --ip-address $5
