#!/bin/bash

# exit on error
set -e

### Azure CLI script to initialise and tear down load-test environment in one script
### this should not be used in CICD as it requires input to begin clean up after load testing

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

### environment variables
# SQL_ADMIN_USER username of priveliged user to execute migrations
# SQL_ADMIN_USER_PASSWORD password of priveliged user

RES_GROUP=$1
RES_GROUP_FUNCTIONS=$2
SQL_SERVER=$3
DB_SCALE=$4
ADMIN_APP=$5
FUNC_CONSUMP=$6
FUNC_APPSVC=$7
SQL_SERVER_REPLICA=$8

./ci-up.sh $RES_GROUP $RES_GROUP_FUNCTIONS $SQL_SERVER $DB_SCALE $ADMIN_APP $FUNC_CONSUMP $FUNC_APPSVC $SQL_SERVER_REPLICA

read -p "Once the load test is complete, press enter to delete database $SQL_DATABASE..."

./ci-down.sh $RES_GROUP $SQL_SERVER $SQL_SERVER_REPLICA

# DONE
