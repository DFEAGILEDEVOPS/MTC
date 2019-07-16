#!/bin/bash

echo "Waiting for $ADMIN_BASE_URL to be available..."

until [ "$(curl -s -o /dev/null -w '%{http_code}' $ADMIN_BASE_URL)" == "302" ]; do
  printf '.'
  sleep 5
done