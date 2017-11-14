#!/bin/bash

# exit on error
set -e

# input parameters
# $1 resource group to target
# $2 cosmosDB instance name

# Set variables for the new account, database, and collection
resourceGroupName=$1
cosmosInstanceName=$2
databaseName='mtc'
collectionThroughput=4000

# create database
az cosmosdb database create \
	--name $cosmosInstanceName \
	--db-name $databaseName \
	--resource-group $resourceGroupName

cd design/schemas/database
declare collections=$(ls -1 | sed -e 's/\..*$//')

## now loop through the above array
for i in $collections
do
   echo "creating collection $i with throughput of $highThroughput RUs"
    az cosmosdb collection create \
	--collection-name $i \
	--name $cosmosInstanceName \
	--db-name $databaseName \
	--resource-group $resourceGroupName \
	--throughput $collectionThroughput
done
