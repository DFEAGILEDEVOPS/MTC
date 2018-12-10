#!/bin/bash

# exit on error
set -e

npm install
node bin/generate-teacher-for-each-school.js
node bin/generate-pupil-data.js
