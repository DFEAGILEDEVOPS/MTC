#!/bin/bash

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

echo "Starting SSH..."
service ssh start

# oddly, docs specify this...
# /usr/sbin/sshd
# ref - https://docs.microsoft.com/en-us/azure/app-service/containers/configure-custom-container#enable-ssh

echo "Starting PM2..."
pm2-docker start pm2.json
