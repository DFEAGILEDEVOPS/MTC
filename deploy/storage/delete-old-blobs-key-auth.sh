#!/usr/bin/env bash

# Set the resource group and storage account name (you can also loop through multiple accounts if needed)
STORAGE_ACCOUNT_NAME=$1
STORAGE_ACCOUNT_KEY=$2
CONTAINER_NAME=$3

# Get the current date in UTC and subtract 7 days
if [[ $(uname) == "Darwin" ]]; then
    # macOS
    CUTOFF_DATE=$(date -u -v-1d "+%Y-%m-%d")
else
    # Linux and others
    CUTOFF_DATE=$(date -d "1 days ago" +%Y-%m-%d)
fi

# Function to delete old blobs
delete_old_blobs() {
    local container_name=$1

    echo "Checking container: $container_name in storage account: $STORAGE_ACCOUNT_NAME"

    # List all blobs in the container with the --include 'metadata' option to get last access time
    blobs=$(az storage blob list --account-name "$STORAGE_ACCOUNT_NAME" --account-key "$STORAGE_ACCOUNT_KEY" --container-name "$container_name" --query "[?properties.creationTime < '$CUTOFF_DATE'].name" --output tsv)

    if [[ -z "$blobs" ]]; then
        echo "No blobs found older than 1 days in container $container_name"
    else
        echo "Deleting blobs not accessed since $CUTOFF_DATE in container $container_name"
        for blob in $blobs; do
            echo "Deleting blob: $blob"
            az storage blob delete --account-name "$STORAGE_ACCOUNT_NAME" --account-key "$STORAGE_ACCOUNT_KEY" --container-name "$container_name" --name "$blob"
        done
    fi

    # Check if the container is empty
    blobs=$(az storage blob list --container-name "$container_name" --account-name "$STORAGE_ACCOUNT_NAME" --account-key "$STORAGE_ACCOUNT_KEY" --query "[].name" -o tsv)

    if [ -z "$blobs" ]
    then
      echo "Deleting empty container: $container"
      az storage container delete --name "$container_name" --account-name "$STORAGE_ACCOUNT_NAME" --account-key "$STORAGE_ACCOUNT_KEY"
    fi
}

delete_old_blobs "$CONTAINER_NAME"

echo "Completed deletion of old blobs in $CONTAINER_NAME container."
