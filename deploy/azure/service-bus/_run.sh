#!/bin/bash

RES_GROUP=$1 # the target resource group
BUS_NAME=$2 # the name of the service bus instance
SCALE="${3:-Standard}"
echo "creating service bus name:'$BUS_NAME' scale:'$SCALE' in '$RES_GROUP'"
az group deployment create --resource-group $RES_GROUP --template-file arm-service-bus.json --parameters bus_namespace=$BUS_NAME scale=$SCALE
