#!/bin/bash

# exit on error
set -e

cd ..
./restart.sh
cd deploy/sql
yarn install
yarn dummy:all
