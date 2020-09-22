#!/bin/bash

if [[ "${ADMIN_BASE_URL:=false}" != "false" ]]; then
  # This will wait for the admin app to be running, meaning SQL migrations have been run
  echo "Waiting for $ADMIN_BASE_URL to be available..."

  until [ "$(curl -s -o /dev/null -w '%{http_code}' $ADMIN_BASE_URL)" == "302" ]; do
    printf '.'
    sleep 5
  done
fi