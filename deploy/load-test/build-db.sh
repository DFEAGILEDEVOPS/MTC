#!/bin/bash

# initialise node runtime
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
nvm use

# exit on error
set -e

# arguments
SQL_SERVER=$1
SQL_DATABASE=$2
DB_SCALE=$3

SQL_AZURE_FQDN="database.windows.net"

### Run Migrations
echo "running database migrations..."
cd ../../admin
yarn install
SQL_SERVER="$SQL_SERVER.$SQL_AZURE_FQDN" SQL_DATABASE=$SQL_DATABASE SQL_AZURE_SCALE=$DB_SCALE yarn migrate-sql

# Bulk Data
echo "running database seeds..."
SQL_SERVER="$SQL_SERVER.$SQL_AZURE_FQDN" SQL_DATABASE=$SQL_DATABASE SQL_AZURE_SCALE=$DB_SCALE yarn seed-sql

echo "inserting bulk data for schools, pupils & teachers..."
cd ../deploy/sql
SQL_SERVER="$SQL_SERVER.$SQL_AZURE_FQDN" SQL_DATABASE=$SQL_DATABASE SQL_AZURE_SCALE=$DB_SCALE yarn dummy:schools
SQL_SERVER="$SQL_SERVER.$SQL_AZURE_FQDN" SQL_DATABASE=$SQL_DATABASE SQL_AZURE_SCALE=$DB_SCALE yarn dummy:pupils
SQL_SERVER="$SQL_SERVER.$SQL_AZURE_FQDN" SQL_DATABASE=$SQL_DATABASE SQL_AZURE_SCALE=$DB_SCALE yarn dummy:teachers
