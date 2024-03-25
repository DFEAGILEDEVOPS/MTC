#!/bin/bash

# exit on error
set -e

ADMIN_HOST=$1
AUTH_HOST=$2
FUNC_CONS_HOST=$3
PUPIL_HOST=$4
STORAGE_ACCOUNT_HOST=$5
PUPIL_SITE_URL=$6

rm -rf ./reports
rm -rf ./html-report
mkdir reports
mkdir html-report

jmeter -t ./scenarios/live-check-journey.jmx -JwaitTimeMs=0 -JadminAppHost=$ADMIN_HOST -JadminAppPort=443 -Jprotocol=https -JpupilApiHost=$AUTH_HOST -JpupilApiPort=443 -JfuncConsHost=$FUNC_CONS_HOST -JfuncConsPort=443 -JstorageAccountHost=$STORAGE_ACCOUNT_HOST -JpupilSiteUrl=$PUPIL_SITE_URL -l reports/mtc_jmeter_test_result.csv -Djmeter.save.saveservice.output_format=csv -e -o html-report/
