#!/bin/bash -ex
cd ../admin
node --version
yarn --version
yarn install --frozen-lockfile
yarn build
cd ../admin-assets
rm -rf ./assets
cp -a ../admin/public/. ./assets
