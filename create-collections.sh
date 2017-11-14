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
lowThroughput=400 
highThroughput=4000

## declare an array variable
declare -a collections=("adminlogonevents" "adminsessions" "attendancecodes" "changelog" "checkforms" "checks" "checkwindows" "identitycounters" "pupils" "schools" "users")

## now loop through the above array
for i in "${collections[@]}"
do
   echo "creating collection $i with throughput of $highThroughput RUs"
   createCollection $i
done

# You can access them using echo "${arr[0]}", "${arr[1]}" also

function createCollection() {
  az cosmosdb collection create \
	--collection-name $1 \
	--name $cosmosInstanceName \
	--db-name $databaseName \
	--resource-group $resourceGroupName \
	--throughput $highThrougput
}