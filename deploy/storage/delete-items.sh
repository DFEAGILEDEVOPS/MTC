#!/bin/bash

scriptDir="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null && pwd )"
jsonSource="$scriptDir/tables-queues.json"

# exit on error
set -e

# input parameters
# $1 storage account name
# $2 storage account key

# Set variables
storageAccountName=$1
storageAccountKey=$2

# clear and rebuild cors rule for the queues
echo "clearing CORS policy on $storageAccountName"
az storage cors clear --services q --account-name $storageAccountName --account-key $storageAccountKey

declare -a queuenames=( $(jq -r '.queues[]' $jsonSource) )

# create queues if they do not exist
for q in "${queuenames[@]}"
do
	echo "deleting $q queue in $storageAccountName"
	az storage queue delete --name $q --account-name $storageAccountName --account-key $storageAccountKey
done

declare -a tablenames=( $(jq -r '.tables[]' $jsonSource) )

# create tables if they do not exist
for t in "${tablenames[@]}"
do
	echo "deleting $t table in $storageAccountName"
	az storage table delete --name $t --account-name $storageAccountName --account-key $storageAccountKey
done
