#!/bin/bash
set -e

# Check if resource group parameter is provided
if [ $# -eq 0 ]; then
    echo "Error: Resource group name is required"
    echo "Usage: $0 <resource-group-name>"
    exit 1
fi

RESOURCE_GROUP=$1

# Verify resource group exists
if ! az group show --name "$RESOURCE_GROUP" &>/dev/null; then
    echo "Error: Resource group '$RESOURCE_GROUP' not found"
    exit 1
fi

# Get all Functions in the specified resource group
echo "Retrieving Functions in resource group: $RESOURCE_GROUP..."
app_services=$(az functionapp list --resource-group "$RESOURCE_GROUP" --query "[].{name:name,resourceGroup:resourceGroup}" -o json)

if [ "$(echo $app_services | jq '. | length')" -eq 0 ]; then
    echo "No Functions found in resource group: $RESOURCE_GROUP"
    exit 0
fi

# Parse the JSON output and configure TLS for each function
echo $app_services | jq -c '.[]' | while read -r app; do
    name=$(echo $app | jq -r '.name')

    echo "Configuring TLS 1.3 for Function: $name"

    # Configure minimum TLS version to 1.3
    az functionapp config set \
        --name $name \
        --resource-group $RESOURCE_GROUP \
        --min-tls-version 1.3

    # Disable older TLS/SSL protocols
    az functionapp config set \
        --name $name \
        --resource-group $RESOURCE_GROUP \
        --ftps-state Disabled \
        --http20-enabled true

   echo "Completed TLS configuration for $name"
done

echo "Configuration complete for all Functions in resource group: $RESOURCE_GROUP"
