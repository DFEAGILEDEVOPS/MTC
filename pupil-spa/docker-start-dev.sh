#!/bin/sh
set -e

echo "Starting pupil-spa dev docker container"
yarn install --frozen-lockfile
yarn start:dev
