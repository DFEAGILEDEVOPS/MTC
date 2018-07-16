#!/bin/bash

# exit on error
set -e

# input parameters
# $1 storage account name
# $2 storage account key

# Set variables
storageAccountName=$1
storageAccountKey=$2

declare -a queuenames=('check-started' 'completed-check' 'pupil-auth' 'pupil-feedback' 'pupil-preferences' 'prepare-check')
# create queues if they do not exist
for q in $queuenames
do
	echo "creating $q queue in $storageAccountName"
	az storage queue create --name $q
                        --account-name $storageAccountName 
												--account-key $storageAccountKey
                        --fail-on-exist false
done

declare -a tablenames=('pupilEvent' 'preparedCheck')
# create tables if they do not exist
for q in $tablenames
do
	echo "creating $q table in $storageAccountName"
	az storage table create --name $q
                        --account-name $storageAccountName 
												--account-key $storageAccountKey
                        --fail-on-exist false
done
