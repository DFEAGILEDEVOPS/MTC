#!/bin/bash -x

echo "Starting SSH..."
service ssh start

sleep 15
cd /usr/src/app/admin
yarn migrate-and-seed-sql
