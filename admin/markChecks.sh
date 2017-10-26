#!/bin/bash -x

# exit on error
set -e

MONGO_CONNECTION_STRING=$1 ./bin/psychometricians-report-v2.js