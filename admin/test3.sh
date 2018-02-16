#!/bin/bash -x

#run migrations
echo '###### Running migrations'
yarn migrate-sql
echo '##### Finished migrations'

npm start > server.log 2>&1 &
PID=$!

MSG='admin app is running under process '
MSG+=$PID
echo $MSG

cd test
rake features OPTS='-t ~@add_multiple_pupils -t ~@add_multiple_pupil_validation -t ~@breadcrumbs -t ~@create_check_window -t ~@edit_check_window -t ~@edit_pupil -t ~@generate_pupil_pins -t ~@manage_check_window -t ~@phase_banner -t ~@pupils_not_taking_check -t ~@pupil_register -t ~@question_time_limits -t ~@restarts'
CUCUMBER_EXIT_CODE=$?

kill -9 $PID

echo "************"
echo " SERVER LOG "
echo "*************"
cat ../server.log

exit $CUCUMBER_EXIT_CODE
