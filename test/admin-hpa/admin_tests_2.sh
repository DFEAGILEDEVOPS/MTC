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

# cd test
# rake features OPTS='-t @generate_pupil_pins,@manage_check_window,@phase_banner,@pupils_not_taking_check,@pupil_register,@question_time_limits,@restarts'
rake features OPTS='-t @generate_pupil_pins,@manage_check_window,@phase_banner,@pupil_register,@question_time_limits'
CUCUMBER_EXIT_CODE=$?

kill -9 $PID

#echo "************"
#echo " SERVER LOG "
#echo "*************"
#cat ../server.log

exit $CUCUMBER_EXIT_CODE
