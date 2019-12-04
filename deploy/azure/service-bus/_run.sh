#!/bin/bash

RES_GROUP=$1 # the target resource group
BUS_NAME=$2 # corresponds to *.params.json file prefix, such as dev, preprod, demo etc
KEY_VAULT_NAME=$3 # the resource group key vault name

az group deployment create --resource-group $RES_GROUP --template-file template.json --parameters bus_namespace=$BUS_NAME
