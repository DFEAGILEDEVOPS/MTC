#!/usr/bin/env bash

# $1 SQL_ADMIN_USER
# $2 SQL_ADMIN_USER_PASSWORD
# $3 SQL_APP_USER_PASSWORD
# $4 SQL_DATABASE (database name)

cd $BUILD_REPOSITORY_LOCALPATH
cd db

export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
nvm use

yarn install --frozen-lockfile --production
SQL_ADMIN_USER=$1 SQL_ADMIN_USER_PASSWORD=$2 SQL_APP_USER_PASSWORD=$3 SQL_DATABASE=$4 SQL_AZURE_SCALE=S0 yarn migrate
