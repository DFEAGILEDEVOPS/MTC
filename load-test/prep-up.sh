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
# 7.  Delete Database (see ./prep-down.sh)

### script arguments
# $1 resource group
# $2 sql server
# $3 db scale (S0, S1 etc.)
# $4 admin web app instance name
# $5 function consumption instance name
# $6 function app service instance name
# $7 secondary resource group (functions)
RES_GROUP=$1
SQL_SERVER=$2
DB_SCALE=$3
ADMIN_APP=$4
FUNC_CONSUMP=$5
FUNC_APPSVC=$6
RES_GROUP_FUNCTIONS=$7


# 1.  Create database with unique name
DB_NAME="load-test-$RANDOM"
az sql db create -g $RES_GROUP -s $SQL_SERVER -n $DB_NAME --service-objective $DB_SCALE

# 2. Bind replica
# TBC

# 3. Run Migrations
# TODO run admin migrations

# 4. Seed Data
# TODO run admin seeds

# 5.  Update web app & function settings to new database
az webapp config appsettings set -g $RES_GROUP -n $ADMIN_APP --settings SQL_DATABASE=$DB_NAME
az webapp config appsettings set -g $RES_GROUP_FUNCTIONS -n $FUNC_CONSUMP --settings SQL_DATABASE=$DB_NAME
az webapp config appsettings set -g $RES_GROUP_FUNCTIONS -n $FUNC_APPSVC --settings SQL_DATABASE=$DB_NAME

# DONE
