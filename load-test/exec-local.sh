#!/bin/bash

# exit on error
set -e

rm -rf ./reports
rm -rf ./html-report
mkdir reports
mkdir html-report

# pre-requisites...
# - admin app running on 3001
# - sql server running
# - redis running
# - pupil auth running
# - func-consumption running
# - check-submit-proxy running

echo "###############################################################"
echo "#                                                             #"
echo "#    Please ensure the following are running...               #"
echo "#                                                             #"
echo "#     - Local SQL Linux                                       #"
echo "#     - Local Redis                                           #"
echo "#     - Admin app                                             #"
echo "#     - Pupil api                                             #"
echo "#     - Func consumption                                      #"
echo "#     - Check Submit proxy function (./check-submit-proxy)    #"
echo "#                                                             #"
echo "###############################################################"
echo "Bulk data will be inserted into sql prior to the load test."
read -n 1 -s -r -p "Press any key when you are ready to continue..."
echo "\nexecuting jmeter scenario 'pin generation, pupil-login, check start and check submission...'"
jmeter -n -t scenarios/_2020/live-pin-gen-with-check.jmx -l reports/mtc_jmeter_test_result.csv -Djmeter.save.saveservice.output_format=csv -e -o html-report/
