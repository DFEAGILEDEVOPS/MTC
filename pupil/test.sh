#!/bin/bash -x

cd pupil
npm start &
PID=$!

MSG='pupil app is running under process '
MSG+=$PID
echo $MSG

cd test
gem install bundler
bundle install
rake features
CUCUMBER_EXIT_CODE=$?

kill -9 $PID
exit $CUCUMBER_EXIT_CODE

