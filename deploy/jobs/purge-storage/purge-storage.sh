#!/bin/bash

# purge MTC storage containers.  Depends on Azure CLI https://docs.microsoft.com/en-us/cli/azure/

# exit on error
set -e

# input parameters
# $1 storage account name
# $2 storage account key

# Set variables
storageAccountName=$1
storageAccountKey=$2

declare -a containerNames=('censusupload' 'check-development-app-upload-files' 'csvuploads' 'psychometricianreportupload')
# delete containers silently - no error if they do not exist
for c in "${containerNames[@]}"
do
	echo "deleting $c container in $storageAccountName"
	az storage container delete --name $c --account-name $storageAccountName --account-key $storageAccountKey
done

# recreate containers
for c in "${containerNames[@]}"
do
	echo "creating $c container in $storageAccountName"
	az storage container create --name $c --account-name $storageAccountName --account-key $storageAccountKey
done
