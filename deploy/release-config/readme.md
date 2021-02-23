# Release Configuration Mappings

In the deploy stage of the Azure DevOps pipeline we submit all application settings with each application that is deployed.

The values are sourced from the Azure DevOps library (non sensitive) and Azure Key Vault (sensitive).


Each application within the service has a 'base' file (such as `admin.base.txt`) containing the config mappings for all environments (dev, test, demo, load, preprod, prod).

Any additional 'per environment' settings are maintained within a separate file (such as `admin.preprod.prod.txt`)
