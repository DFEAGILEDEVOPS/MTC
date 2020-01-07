#!/bin/bash

# exit on error
set -e

### Azure CLI script to initialise load-test environment with fresh database
# Create Database with unique name
# Bind replica (optional)
# Run Migrations
# Seed Data
# Update admin app database name setting
# Enable / Disable admin app replica read mode
# Update function consumption app database name setting
# Update function app service database name setting
# Run load test (manual operation)
# Delete Database

### script arguments
# $1  main resource group
# $2  functions resource group
# $3  sql server
# $4  db scale (S0, S1 etc.)
# $5  admin web app instance name
# $6  function consumption instance name
# $7  function app service instance name
# $8  sql replica server name
# $9  sql server user (for running migrations)
# $10 sql server user password

RES_GROUP=$1
RES_GROUP_FUNCTIONS=$2
SQL_SERVER=$3
DB_SCALE=$4
ADMIN_APP=$5
FUNC_CONSUMP=$6
FUNC_APPSVC=$7
SQL_SERVER_REPLICA=$8

### Create database with unique name
DB_SUFFIX=$(openssl rand -hex 4)
SQL_DATABASE="mtc-load-test-$DB_SUFFIX"
echo "creating database $SQL_DATABASE on $SQL_SERVER.database.windows.net..."
az sql db create -g $RES_GROUP -s $SQL_SERVER -n $SQL_DATABASE --service-objective $DB_SCALE

### Create replica
if [ $SQL_SERVER_REPLICA ]
then
  echo "setting up replica of database $SQL_DATABASE on server $SQL_SERVER_REPLICA..."
  az sql db replica create -g $RES_GROUP -s $SQL_SERVER -n $SQL_DATABASE \
    --partner-server $SQL_SERVER_REPLICA --service-objective $DB_SCALE
fi

### Run Migrations
echo "running database migrations..."
cd ../../admin
yarn install
SQL_SERVER="$SQL_SERVER.database.windows.net" SQL_DATABASE=$SQL_DATABASE SQL_AZURE_SCALE=$DB_SCALE yarn migrate-sql
# Seed Data
echo "running database seeds..."
SQL_SERVER="$SQL_SERVER.database.windows.net" SQL_DATABASE=$SQL_DATABASE SQL_AZURE_SCALE=$DB_SCALE yarn seed-sql

### Update web app & function settings to new database
echo "updating target database for $ADMIN_APP to $SQL_DATABASE"
az webapp config appsettings set -g $RES_GROUP -n $ADMIN_APP --settings SQL_DATABASE=$SQL_DATABASE > /dev/null

if [ $SQL_SERVER_REPLICA ]
then
  echo "configuring read replica for $ADMIN_APP..."
  REPLICA_FULL_NAME="$SQL_SERVER_REPLICA.database.windows.net"
  az webapp config appsettings set -g $RES_GROUP -n $ADMIN_APP \
    --settings SQL_ALLOW_REPLICA_FOR_READS=true SQL_DATABASE_REPLICA=$SQL_DATABASE SQL_SERVER_REPLICA=$REPLICA_FULL_NAME  > /dev/null
else
  echo "disabling read replica for $ADMIN_APP..."
  az webapp config appsettings set -g $RES_GROUP -n $ADMIN_APP --settings SQL_ALLOW_REPLICA_FOR_READS=false  > /dev/null
fi

echo "updating target database for $FUNC_CONSUMP to $SQL_DATABASE"
az webapp config appsettings set -g $RES_GROUP_FUNCTIONS -n $FUNC_CONSUMP --settings SQL_DATABASE=$SQL_DATABASE  > /dev/null

echo "updating target database for $FUNC_APPSVC to $SQL_DATABASE"
az webapp config appsettings set -g $RES_GROUP_FUNCTIONS -n $FUNC_APPSVC --settings SQL_DATABASE=$SQL_DATABASE  > /dev/null

read -p "Once the load test is complete, press enter to delete database $SQL_DATABASE..."
az sql db delete --name $SQL_DATABASE -g $RES_GROUP --server $SQL_SERVER --no-wait
echo "delete database '$SQL_DATABASE' operation submitted to server $SQL_SERVER..."

if [ $SQL_SERVER_REPLICA ]
then
  az sql db delete --name $SQL_DATABASE -g $RES_GROUP --server $SQL_SERVER_REPLICA --no-wait
  echo "delete database $SQL_DATABASE operation submitted to server $SQL_SERVER_REPLICA..."
fi
# DONE
