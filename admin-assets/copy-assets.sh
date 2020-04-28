#!/bin/bash -x
cd ../admin
yarn install --frozen-lockfile
cd ../admin-assets
rm -rf ./assets
cp -a ../admin/public/. ./assets
