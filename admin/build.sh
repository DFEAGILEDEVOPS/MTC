#!/bin/bash

# set errors on
set -e

rm -rf dist
tsc
cp -a ./assets ./dist/assets
cp -a ./public ./dist/public
cp -a ./views ./dist/views
if [[ -f "../.env" ]]; then
  cp ../.env ./.env
fi
