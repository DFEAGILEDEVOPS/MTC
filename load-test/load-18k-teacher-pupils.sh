#!/bin/bash

# exit on error
set -e

<<<<<<< HEAD
=======
# depends on admin modules, so need install first
>>>>>>> feature/27185-load-test-data
cd ../admin
npm install
cd ../load-test
npm install
node bin/generate-teacher-for-each-school.js
node bin/generate-pupil-data.js
