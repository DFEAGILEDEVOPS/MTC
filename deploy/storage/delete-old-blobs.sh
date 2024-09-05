#!/bin/bash

# Set your Azure Storage account details
STORAGE_ACCOUNT_NAME="your_storage_account_name"
CONTAINER_NAME="your_container_name"

# Set the number of days
DAYS_OLD=7

# Get the current date and calculate the cutoff date
CURRENT_DATE=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
CUTOFF_DATE=$(date -u -d "$CURRENT_DATE - $DAYS_OLD days" +"%Y-%m-%dT%H:%M:%SZ")

# List blobs and filter those older than the cutoff date
az storage blob list \
    --account-name $STORAGE_ACCOUNT_NAME \
    --container-name $CONTAINER_NAME \
    --query "[?properties.lastAccessTime < '$CUTOFF_DATE'].name" \
    --output tsv |
while read -r blob_name; do
    echo "Deleting blob: $blob_name"
    az storage blob delete \
        --account-name $STORAGE_ACCOUNT_NAME \
        --container-name $CONTAINER_NAME \
        --name "$blob_name" \
        --auth-mode login
done

echo "Blob deletion process completed."
