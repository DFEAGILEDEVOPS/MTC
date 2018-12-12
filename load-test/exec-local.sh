#!/bin/bash

# exit on error
set -e

rm -rf ./reports
rm -rf ./html-report
mkdir reports
mkdir html-report
jmeter -n -t ./scenarios/admin-generate-pins.jmx -l reports/mtc_admin_test_result.csv -Djmeter.save.saveservice.output_format=csv -e -o html-report/
