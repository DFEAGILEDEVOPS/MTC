#!/bin/bash -x

npm start > server.log 2>&1 &
PID=$!

MSG='admin app is running under process '
MSG+=$PID
echo $MSG

cd test
echo " Cucumber install location "
which cucumber
rake features OPTS='-t @travis1'
CUCUMBER_EXIT_CODE=$?

kill -9 $PID

echo "************"
echo " SERVER LOG "
echo "*************"
cat ../server.log

exit $CUCUMBER_EXIT_CODE
