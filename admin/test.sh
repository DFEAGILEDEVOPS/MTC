#!/bin/bash -x

npm start > server.log 2>&1 &
PID=$!

MSG='admin app is running under process '
MSG+=$PID
echo $MSG

cd test
rake features
CUCUMBER_EXIT_CODE=$?

kill -9 $PID
exit $CUCUMBER_EXIT_CODE
