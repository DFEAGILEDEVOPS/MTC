#!/bin/bash

echo "Waiting for $SQL_SERVER:1433 to be available..."

until [["$(curl $SQL_SERVER:1433)" == *"Empty reply from server"*]]; do
  printf '.'
  sleep 5
done