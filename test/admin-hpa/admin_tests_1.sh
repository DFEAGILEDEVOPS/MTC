#!/bin/bash -x

cd ../../admin && yarn start > server.log 2>&1 &
PID=$!

MSG='admin app is running under process '
MSG+=$PID
echo $MSG

rake features OPTS='-t @add_multiple_pupils,@add_multiple_pupil_validation,@breadcrumbs,@create_check_window,@edit_check_window,@edit_pupil'
CUCUMBER_EXIT_CODE=$?

kill -9 $PID

#echo "************"
#echo " SERVER LOG "
#echo "*************"
#cd ../../admin && cat server.log

exit $CUCUMBER_EXIT_CODE
