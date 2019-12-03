#!/bin/bash

TARGET_ENV=$1

az group deployment create
  --resource-group rg-t1dv-mtc \
  --template-file template.json \
  --parameters "@$TARGET_ENV.params.json"
