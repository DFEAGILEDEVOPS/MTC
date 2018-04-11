#!/bin/bash -x

# exit on error
set -e

# start admin app
cd ../../admin && npm start > server.admin.log 2>&1 &

# start pupil app
npm start &
PID=$!

MSG='pupil-spa app is running under process '
MSG+=${PID}
echo ${MSG}

sleep 30

cd test
rake parallel NODES=6 GROUP_SIZE=16 OPTS='-t @header_footer'
CUCUMBER_EXIT_CODE=$?

kill -9 ${PID}
exit ${CUCUMBER_EXIT_CODE}
