#!/bin/bash

echo "Starting SSH..."
service ssh start

echo "Starting PM2..."
pm2-docker start pm2.json
