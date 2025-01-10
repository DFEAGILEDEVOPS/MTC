#!/bin/bash
set -e

#!/bin/bash

# Get all App Services across all resource groups
echo "Retrieving all App Services..."
app_services=$(az webapp list --query "[].{name:name,resourceGroup:resourceGroup}" -o json)
echo $app_services
exit 0;

# Parse the JSON output and configure TLS for each app service
echo $app_services | jq -c '.[]' | while read -r app; do
    name=$(echo $app | jq -r '.name')
    rg=$(echo $app | jq -r '.resourceGroup')

    echo "Configuring TLS 1.3 for App Service: $name in Resource Group: $rg"

    # Configure minimum TLS version to 1.3
    az webapp config set \
        --name $name \
        --resource-group $rg \
        --min-tls-version 1.3

    # Disable older TLS/SSL protocols
    az webapp config set \
        --name $name \
        --resource-group $rg \
        --ftps-state Disabled \
        --http20-enabled true

    echo "Completed TLS configuration for $name"
done

echo "Configuration complete for all App Services"
