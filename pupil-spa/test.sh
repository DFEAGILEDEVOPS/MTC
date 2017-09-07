#!/bin/bash -x

# exit on error
set -e


# start admin app
cd ../admin && npm start > server.admin.log 2>&1 &

# start pupil app
npm start &
PID=$!

MSG='pupil-spa app is running under process '
MSG+=${PID}
echo ${MSG}

cd test
rake parallel NODES=4 GROUP_SIZE=6
CUCUMBER_EXIT_CODE=$?

kill -9 ${PID}
exit ${CUCUMBER_EXIT_CODE}
