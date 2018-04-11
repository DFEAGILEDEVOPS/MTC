#!/bin/bash -x

cd ../../admin && yarn start > server.log 2>&1 &
PID=$!

MSG='admin app is running under process '
MSG+=$PID
echo $MSG

rake features OPTS='-t @breadcrumbs'
CUCUMBER_EXIT_CODE=$?

kill -9 $PID

echo "************"
echo " SERVER LOG "
echo "*************"
cat ../server.log

exit $CUCUMBER_EXIT_CODE
