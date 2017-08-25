#!/bin/bash -x

# exit on error
set -e

cd pupil-spa
npm start &
PID=$!

MSG='pupil-spa app is running under process '
MSG+=${PID}
echo ${MSG}

cd test
gem install bundler
bundle install
rake features
CUCUMBER_EXIT_CODE=$?

kill -9 ${PID}
exit ${CUCUMBER_EXIT_CODE}
