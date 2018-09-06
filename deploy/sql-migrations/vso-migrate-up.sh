#!/usr/bin/env bash

# $1 is the SQL_ADMIN_USER
# $2 is the SQL_ADMIN_USER_PASSWORD
# $3 is the SQL_APP_USER_PASSWORD
# $4 is the SQL_DATABASE (database name)
cd $BUILD_REPOSITORY_LOCALPATH
cd admin
npm install
DB_NAME="${$4/./_}"
echo "DB_NAME is $DB_NAME"
SQL_ADMIN_USER=$1 SQL_ADMIN_USER_PASSWORD=$2 SQL_APP_USER_PASSWORD=$3 SQL_DATABASE=$DB_NAME SQL_AZURE_SCALE=S0 npm run migrate-sql
