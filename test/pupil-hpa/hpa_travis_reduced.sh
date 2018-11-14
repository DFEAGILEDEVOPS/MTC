#!/bin/bash -x

# start pupil-api
cd ../../pupil-api && npm start > server.auth.log 2>&1 &

# start function
cd ../../functions && npm start > server.auth.log 2>&1 &

# start pupil app
cd ../../pupil-spa && npm start &

cd ../../admin && yarn start > server.log 2>&1 &
PID=$!

MSG='admin app is running under process '
MSG+=$PID
echo $MSG

rake features OPTS='-t @travis'
CUCUMBER_EXIT_CODE=$?

kill -9 $PID

#echo "************"
#echo " SERVER LOG "
#echo "*************"
#cat ../server.log

exit $CUCUMBER_EXIT_CODE
