#!/bin/bash -x
cd ../admin
npm install
cd ../admin-assets
rm -rf ./assets
cp -a ../admin/public/. ./assets
