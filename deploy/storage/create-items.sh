#!/bin/bash

# exit on error
set -e

# input parameters
# $1 storage account name
# $2 storage account key

# Set variables
storageAccountName=$1
storageAccountKey=$2

declare -a queuenames=('check-started' 'check-complete' 'pupil-feedback' 'pupil-prefs' 'prepare-check')
# create queues if they do not exist
for q in "${queuenames[@]}"
do
	echo "creating $q queue in $storageAccountName"
	az storage queue create --name $q --account-name $storageAccountName --account-key $storageAccountKey
done

declare -a tablenames=('pupilEvent' 'preparedCheck')
# create tables if they do not exist
for t in "${tablenames[@]}"
do
	echo "creating $t table in $storageAccountName"
	az storage table create --name $t --account-name $storageAccountName --account-key $storageAccountKey
done
