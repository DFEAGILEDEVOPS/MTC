#!/usr/bin/env bash

echo "Purging Azure Storage..."
(cd admin && yarn purgestorage)

echo "Starting docker..."
(docker-compose up -d)

echo "Stabilising MS SQL Server..."
sleep 5

echo -n "Running migrations..."
(cd admin && yarn migrate-sql)

echo "MTC Infrastructure ready!"
