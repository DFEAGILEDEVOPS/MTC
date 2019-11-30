#!/bin/bash

az group deployment create \
  --resource-group rg-t1dv-mtc \
  --template-file template.json \
  --parameters @dev.params.json
