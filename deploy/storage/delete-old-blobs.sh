#!/bin/bash

# Set the resource group and storage account name (you can also loop through multiple accounts if needed)
STORAGE_ACCOUNT_NAME=$1

# Get the current date in UTC and subtract 7 days
CUTOFF_DATE=$(date -u -v-7d "+%Y-%m-%d")

# Function to delete old blobs
delete_old_blobs() {
    local container_name=$2

    echo "Checking container: $container_name in storage account: $STORAGE_ACCOUNT_NAME"

    # List all blobs in the container with the --include 'metadata' option to get last access time
    blobs=$(az storage blob list --account-name "$STORAGE_ACCOUNT_NAME" --auth-mode login --container-name "$container_name" --query "[?properties.lastAccessedOn < '$CUTOFF_DATE'].name" --output tsv)

    if [[ -z "$blobs" ]]; then
        echo "No blobs found older than 7 days in container $container_name"
    else
        echo "Deleting blobs not accessed since $CUTOFF_DATE in container $container_name"
        for blob in $blobs; do
            echo "Deleting blob: $blob"
            az storage blob delete --account-name "$STORAGE_ACCOUNT_NAME" --auth-mode login --container-name "$container_name" --name "$blob"
        done
    fi

    # Check if the container is empty
    blobs=$(az storage blob list --container-name $container --account-name <storage-account-name> --auth-mode login --query "[].name" -o tsv)

    if [ -z "$blobs" ]
    then
      echo "Deleting empty container: $container"
      az storage container delete --name $container --account-name <storage-account-name> --auth-mode login --yes
    fi
}

# Get the list of containers in the storage account
containers=$(az storage container list --account-name "$STORAGE_ACCOUNT_NAME" --auth-mode login --query "[].name" --output tsv)

# Loop through each container and process blobs
for container in $containers; do
    delete_old_blobs "$storage_account" "$container"
done


echo "Completed processing all storage accounts and containers."
