#!/bin/bash

# exit on error
set -e

# depends on admin modules, so need install first
cd ../admin
yarn install
cd ../load-test
yarn install
node bin/generate-teacher-for-each-school.js
node bin/generate-pupil-data.js
