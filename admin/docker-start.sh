#!/bin/bash

echo "migrate is $MIGRATE."
if [ "$MIGRATE" == "1" ]
then
  WAIT_TIME="20s"
  echo "waiting $WAIT_TIME seconds for SQL Server to come online..."
  sleep $WAIT_TIME
  echo "running database migrations..."
  yarn migrate-sql
fi

pm2-docker start pm2.json