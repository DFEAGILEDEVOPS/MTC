#!/bin/bash -x

# start pupil-api
cd ../../pupil-api && yarn start > api.log 2>&1 &

# start pupil app
cd ../../pupil-spa && yarn start &

cd ../../admin && yarn start > admin.log 2>&1 &
PID=$!

MSG='admin app is running under process '
MSG+=$PID
echo $MSG

echo 'sleeping for 120 seconds to allow the pupil spa to boot...'
sleep 120

rake features OPTS='-t @travis'
CUCUMBER_EXIT_CODE=$?

kill -9 $PID

# echo "************"
# echo " ADMIN LOG"
# echo "************"
# cat ../../admin/admin.log
#
# echo "***********"
# echo " API LOG"
# echo "***********"
# cat ../../pupil-api/api.log

exit $CUCUMBER_EXIT_CODE
