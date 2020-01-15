#!/bin/bash
set -e

cd ./tslib
yarn install
cd ../func-consumption
yarn install
yarn build

cd ..
docker-compose -f docker-compose.yml -f docker-compose.functions.yml up --build -d && sleep 30
