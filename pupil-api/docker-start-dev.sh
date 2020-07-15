#!/bin/bash
set -x
set -e

yarn install --frozen-lockfile
yarn clean
yarn start
