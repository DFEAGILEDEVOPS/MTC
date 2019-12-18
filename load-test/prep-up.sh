#!/bin/bash

# exit on error
set -e

### Azure CLI script to initialise load-test environment with fresh database
# 1.  Create Database with unique name
# 2.  Bind replica (optional for now)
# 3.  Run Migrations
# 4.  Seed Data
# 5.  Update web app & function settings to new database
# 6.  Run load test (manual operation)
# 7.  Delete Database

### script arguments
# $1 main resource group
# $2 functions resource group
# $3 sql server
# $4 db scale (S0, S1 etc.)
# $5 admin web app instance name
# $6 function consumption instance name
# $7 function app service instance name
# $8 sql replica server name

RES_GROUP=$1
RES_GROUP_FUNCTIONS=$2
SQL_SERVER=$3
DB_SCALE=$4
ADMIN_APP=$5
FUNC_CONSUMP=$6
FUNC_APPSVC=$7
SQL_SERVER_REPLICA=$8

# 1.  Create database with unique name
DB_SUFFIX=$(openssl rand -hex 4)
DB_NAME="mtc-load-test-$DB_SUFFIX"
echo "creating database $DB_NAME on $SQL_SERVER.database.windows.net..."
az sql db create -g $RES_GROUP -s $SQL_SERVER -n $DB_NAME --service-objective $DB_SCALE

# 2. Bind replica
if [ $SQL_SERVER_REPLICA ]
then
  echo "setting up replica of database $DB_NAME on server $SQL_SERVER_REPLICA..."
  az sql db replica create -g $RES_GROUP -s $SQL_SERVER -n $DB_NAME
    --partner-server $SQL_SERVER_REPLICA --service-objective $DB_SCALE
fi

# 3. Run Migrations
echo "TODO: run admin migrations"

# 4. Seed Data
echo "TODO: run admin seeds"

# 5.  Update web app & function settings to new database
echo "updating target database for $ADMIN_APP to $DB_NAME"
az webapp config appsettings set -g $RES_GROUP -n $ADMIN_APP --settings SQL_DATABASE=$DB_NAME

if [ $SQL_SERVER_REPLICA ]
then
  echo "configuring read replica for $ADMIN_APP..."
  az webapp config appsettings set -g $RES_GROUP -n $ADMIN_APP
    --settings SQL_ALLOW_REPLICA_FOR_READS=true SQL_DATABASE_REPLICA=$DB_NAME SQL_SERVER_REPLICA=$SQL_SERVER_REPLICA
else
  echo "disabling read replica for $ADMIN_APP..."
  az webapp config appsettings set -g $RES_GROUP -n $ADMIN_APP
    --settings SQL_ALLOW_REPLICA_FOR_READS=false
fi

echo "updating target database for $FUNC_CONSUMP to $DB_NAME"
az webapp config appsettings set -g $RES_GROUP_FUNCTIONS -n $FUNC_CONSUMP --settings SQL_DATABASE=$DB_NAME

echo "updating target database for $FUNC_APPSVC to $DB_NAME"
az webapp config appsettings set -g $RES_GROUP_FUNCTIONS -n $FUNC_APPSVC --settings SQL_DATABASE=$DB_NAME

read -p "Once the load test is complete, press enter to delete database $DB_NAME..."
az sql db delete --name $DB_NAME -g $RES_GROUP --server $SQL_SERVER --no-wait
echo "delete database '$DB_NAME' operation submitted to server $SQL_SERVER..."

if [ $SQL_SERVER_REPLICA ]
then
  az sql db delete --name $DB_NAME -g $RES_GROUP --server $SQL_SERVER_REPLICA --no-wait
  echo "delete database $DB_NAME operation submitted to server $SQL_SERVER_REPLICA..."
fi
# DONE
