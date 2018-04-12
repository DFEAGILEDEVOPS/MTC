#!/usr/bin/env bash

# $1 is the SQL_ADMIN_USER
# $2 is the SQL_ADMIN_USER_PASSWORD
# $3 is the SQL_APP_USER_PASSWORD
cd $BUILD_REPOSITORY_LOCALPATH
cd admin
npm install
SQL_ADMIN_USER=$1 SQL_ADMIN_USER_PASSWORD=$2 SQL_APP_USER_PASSWORD=$3 npm run migrate-sql
