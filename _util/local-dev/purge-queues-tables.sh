#!/bin/bash

# exit on error
set -e

# input parameters
# $1 storage account name
# $2 storage account key
# $3 storage service (cors) allowed origins

# Set variables
storageAccountName=$1
storageAccountKey=$2
allowedOrigins=$3

  # set the cors rule for the queue
  az storage cors add --methods POST --origins allowedOrigins --services q --account-name $storageAccountName --account-key $storageAccountKey

declare -a queuenames=('check-started' 'check-complete' 'pupil-feedback' 'pupil-prefs' 'prepare-check' 'pupil-status')
# create queues if they do not exist
for q in "${queuenames[@]}"
do
	echo "deleting and creating $q queue in $storageAccountName"
  az storage queue delete --name $q --account-name $storageAccountName --account-key $storageAccountKey --fail-not-exist 0
	az storage queue create --name $q --account-name $storageAccountName --account-key $storageAccountKey
done

declare -a tablenames=('pupilEvent' 'preparedCheck')
# create tables if they do not exist
for t in "${tablenames[@]}"
do
	echo "deleting and creating $t table in $storageAccountName"
  az storage queue delete --name $q --account-name $storageAccountName --account-key $storageAccountKey --fail-not-exist 0
	az storage table create --name $t --account-name $storageAccountName --account-key $storageAccountKey
done
