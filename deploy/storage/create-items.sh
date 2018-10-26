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

# set the cors rule for the queues
az storage cors add --methods POST --origins allowedOrigins --services q --account-name $storageAccountName --account-key $storageAccountKey

declare -a queuenames=('check-started' 'check-complete' 'prepare-check' 'pupil-feedback' 'pupil-login' 'pupil-prefs' 'pupil-status')
# create queues if they do not exist
for q in "${queuenames[@]}"
do
	echo "creating $q queue in $storageAccountName"
	az storage queue create --name $q --account-name $storageAccountName --account-key $storageAccountKey
done

declare -a tablenames=('preparedCheck' 'pupilEvent')
# create tables if they do not exist
for t in "${tablenames[@]}"
do
	echo "creating $t table in $storageAccountName"
	az storage table create --name $t --account-name $storageAccountName --account-key $storageAccountKey
done
