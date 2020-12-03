#!/bin/bash -x
cd ../admin
node --version
yarn --version
nvm use
yarn install --frozen-lockfile
cd ../admin-assets
rm -rf ./assets
cp -a ../admin/public/. ./assets
