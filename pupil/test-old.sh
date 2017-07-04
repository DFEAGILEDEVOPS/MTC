#!/bin/bash -x

node server.js &
PID=$!

MSG='node is running under process '
MSG+=$PID
echo $MSG

cd test
gem install bundler
bundle install
BASE_URL=http://localhost:3000 cucumber
CUCUMBER_EXIT_CODE=$?

kill -9 $PID
exit $CUCUMBER_EXIT_CODE

