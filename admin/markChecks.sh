#!/bin/bash -x

# exit on error
set -e

echo "con string is $1"

MONGO_CONNECTION_STRING=$1 ./bin/psychometricians-report-v2.js