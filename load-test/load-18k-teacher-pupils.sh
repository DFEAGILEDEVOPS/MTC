#!/bin/bash

# exit on error
set -e

cd ../admin
npm install
cd ../load-test
npm install
node bin/generate-teacher-for-each-school.js
node bin/generate-pupil-data.js
