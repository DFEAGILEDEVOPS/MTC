#!/bin/bash

# Variables
STORAGE_ACCOUNT=$1

# Get a list of all blob containers in the storage account
containers=$(az storage container list --account-name $STORAGE_ACCOUNT --query "[].name" -o tsv --auth-mode login)

# Loop through each container
for container in $containers; do
    # Check if the container name starts with "azure-webjobs"
    if [[ $container != azure-webjobs* ]]; then
        echo "Deleting container: $container"
        az storage container delete --name $container --account-name $STORAGE_ACCOUNT --auth-mode login
    else
        echo "Skipping container: $container as it is used exclusively by Azure Functions."
    fi
done

echo "Deleted all blob containers from $STORAGE_ACCOUNT (except Azure Functions containers)."
