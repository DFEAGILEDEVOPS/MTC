#!/bin/bash -x

# exit on error
set -e

MONGO_CONNECTION_STRING=$MongoConnectionString ./bin/psychometricians-report-v2.js