#!/bin/bash

echo "Starting SSH..."
service ssh start

echo "migrate is $MIGRATE."
if [ "$MIGRATE" == "1" ]
then
  echo "running database migrations..."
  yarn migrate-sql
fi
if [ "$SEED" == "1" ]
then
  echo "running database seeds..."
  yarn seed-sql
fi

echo "Starting PM2..."
pm2-docker start pm2.json
