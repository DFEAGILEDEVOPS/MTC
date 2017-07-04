#!/bin/bash -x

cd admin
npm start &
PID=$!

MSG='admin app is running under process '
MSG+=$PID
echo $MSG

cd test
gem install bundler
bundle install
cucumber
CUCUMBER_EXIT_CODE=$?

kill -9 $PID
exit $CUCUMBER_EXIT_CODE

