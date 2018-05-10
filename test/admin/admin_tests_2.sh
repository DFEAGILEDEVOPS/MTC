#!/bin/bash -x

cd ../../admin && yarn start > server.log 2>&1 &
PID=$!

MSG='admin app is running under process '
MSG+=$PID
echo $MSG

cd test
rake features OPTS='-t @generate_pupil_pins,@manage_check_window,@phase_banner,@pupils_not_taking_check,@pupil_register,@question_time_limits,@restarts'
CUCUMBER_EXIT_CODE=$?

kill -9 $PID

#echo "************"
#echo " SERVER LOG "
#echo "*************"
#cat ../server.log

exit $CUCUMBER_EXIT_CODE
