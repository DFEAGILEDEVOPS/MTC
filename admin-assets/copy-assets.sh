#!/bin/bash -x
cd ../admin
yarn install
cd ../admin-assets
rm -rf ./assets
cp -a ../admin/public/. ./assets
