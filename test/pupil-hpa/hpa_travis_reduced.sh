#!/bin/bash -x

# start pupil-api
cd ../../pupil-api && npm start > api.log 2>&1 &

# start function
cd ../../functions && npm start > functions.log 2>&1 &

# start pupil app
cd ../../pupil-spa && npm start &

cd ../../admin && yarn start > admin.log 2>&1 &
PID=$!

MSG='admin app is running under process '
MSG+=$PID
echo $MSG

rake features OPTS='-t @travis'
CUCUMBER_EXIT_CODE=$?

kill -9 $PID

#echo "************"
#echo " ADMIN LOG"
#echo "************"
#cat ../admin.log

echo "***********"
echo " API LOG"
echo "***********"
cat ../api.log

echo "**************"
echo " FUNCTIONS LOG"
echo "**************"
cat ../functions.log

exit $CUCUMBER_EXIT_CODE
