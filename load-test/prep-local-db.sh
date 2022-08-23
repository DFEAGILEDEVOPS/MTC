#!/bin/bash

# exit on error
set -e

cd ../deploy/sql
yarn install --frozen-lockfile --production
yarn dummy:all
