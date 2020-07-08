#!/bin/bash

echo "Starting SSH..."
service ssh start

echo "Running yarn..."
yarn install --frozen-lockfile

echo "Dev Start: not running in PM2"
yarn start
