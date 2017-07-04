#!/bin/bash -x

cd pupil
npm start &
PID=$!

MSG='node is running under process '
MSG+=$PID
echo $MSG

cd test
gem install bundler
bundle install
cucumber
CUCUMBER_EXIT_CODE=$?

kill -9 $PID
exit $CUCUMBER_EXIT_CODE

