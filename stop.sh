#!/usr/bin/env bash

echo "Purging Azure Storage..."
cd admin && yarn purgestorage

echo "Stopping docker..."
docker-compose down

echo "MTC Infrastructure down!"
