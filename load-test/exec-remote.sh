#!/bin/bash

# exit on error
set -e

ADMIN_HOST=$1
AUTH_HOST=$2
FUNC_CONS_HOST=$3
PUPIL_HOST=$4

rm -rf ./reports
rm -rf ./html-report
mkdir reports
mkdir html-report

jmeter -t scenarios/2021/live-checks-with-submit.jmx -JwaitTimeMs=0 -JadminAppHost=$ADMIN_HOST -Jprotocol=https -Jport=443 -JpupilApiHost=$AUTH_HOST -JproxyFunctionHost=$FUNC_CONS_HOST -JpupilSiteUrl=$PUPIL_HOST -l reports/mtc_jmeter_test_result.csv -Djmeter.save.saveservice.output_format=csv -e -o html-report/
