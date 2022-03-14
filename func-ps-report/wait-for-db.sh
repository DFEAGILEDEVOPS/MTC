#!/bin/sh
# wait-for-db.sh

set -e

host="$1"
shift
cmd="$@"

until node ./db-check.js; do
  >&2 echo "sqldb is unavailable - sleeping"
  sleep 2
done

>&2 echo "sqldb is up - executing command"
exec $cmd
