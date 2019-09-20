#!/bin/bash

scriptDir="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null && pwd )"
jsonSource="$scriptDir/tables-queues.json"

# exit on error
set -e

# input parameters
# $1 storage account name
# $2 storage account key
# $3 storage service (cors) allowed origins
# $4 service bus namespace
# $5 resource group name

# Set variables
storageAccountName=$1
storageAccountKey=$2
allowedOrigins=$3
sbNamespace=$4
resourceGroupName=$5

# clear and rebuild cors rule for the queues
echo "clearing CORS policy on $storageAccountName"
az storage cors clear --services q --account-name $storageAccountName --account-key $storageAccountKey
echo "setting CORS policy on $storageAccountName for $allowedOrigins"
az storage cors add --methods HEAD OPTIONS POST --origins $allowedOrigins --services q --account-name $storageAccountName --account-key $storageAccountKey --allowed-headers '*' --exposed-headers '*'

declare -a queuenames=( $(jq -r '.queues[]' $jsonSource) )

# create queues if they do not exist
for q in "${queuenames[@]}"
do
	echo "creating $q queue in $storageAccountName"
	az storage queue create --name $q --account-name $storageAccountName --account-key $storageAccountKey
done

declare -a tablenames=( $(jq -r '.tables[]' $jsonSource) )

# create tables if they do not exist
for t in "${tablenames[@]}"
do
	echo "creating $t table in $storageAccountName"
	az storage table create --name $t --account-name $storageAccountName --account-key $storageAccountKey
done

declare -a sbqueuenames=( $(jq -r '.servicebusqueues[]' $jsonSource) )

# create service bus queues if they do not exist
for t in "${sbqueuenames[@]}"
do
	echo "creating $sbq service bus queue in $sbNamespace"
	az servicebus queue create --resource-group $resourceGroupName --namespace-name $sbNamespace --name $sbq
done
