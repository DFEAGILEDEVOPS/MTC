#!/bin/bash

scriptDir="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null && pwd )"
jsonSource="$scriptDir/tables-queues.json"

# exit on error
set -e

# input parameters
# $1 storage account name

# Set variables
storageAccountName=$1

declare -a containers=( $(jq -r '.blobcontainers[]' $jsonSource) )

# create queues if they do not exist
for c in "${containers[@]}"
do
  echo "purging blobs from $c container in $storageAccountName"
  {
    az storage blob delete-batch -s $c --pattern "*" --account-name $storageAccountName &&
    echo "container $c found, blobs purged"
  } || {
    echo "container $c not found"
  }
done
