#!/bin/bash

# exit on error
set -e

cd ../deploy/sql
yarn install
yarn dummy:all
