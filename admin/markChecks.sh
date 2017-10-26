#!/bin/bash -x

# exit on error
set -e

MONGO_CONNECTION_STRING=$MONGO_CONNECTION_STRING ./bin/psychometricians-report-v2.js