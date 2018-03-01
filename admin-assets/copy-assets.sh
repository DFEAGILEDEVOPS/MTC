#!/bin/bash -x
cd ../admin
gulp build
cd ../admin-assets
rm -rf ./assets
cp -a ../admin/public/. ./assets
# docker build -t mtc-admin-assets .
