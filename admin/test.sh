#!/bin/bash -x

npm start > server.log 2>&1 &
PID=$!

MSG='admin app is running under process '
MSG+=$PID
echo $MSG

cd test
rake features OPTS='-t @add_multiple_pupils -t @add_multiple_pupil_validation -t @breadcrumbs -t @create_check_window -t @edit_check_window -t @edit_pupil'
CUCUMBER_EXIT_CODE=$?

kill -9 $PID

echo "************"
echo " SERVER LOG "
echo "*************"
cat ../server.log

exit $CUCUMBER_EXIT_CODE
