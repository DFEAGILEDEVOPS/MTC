#!/bin/bash -x

rm -rf ./assets
cp -a ../admin/public/. ./assets
docker build -t admin-assets .
