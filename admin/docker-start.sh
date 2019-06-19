#!/bin/bash

echo "migrate is $MIGRATE."
if [ "$MIGRATE" == "1" ]
then
  echo "running database migrations..."
  yarn migrate-and-seed-sql
fi

pm2-docker start pm2.json