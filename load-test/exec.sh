#!/bin/bash

# exit on error
set -e

rm -rf reports
mkdir reports
jmeter -n -t ./scenarios/admin-generate-pins/admin-generate-pins-min.jmx -l reports/mtc_admin_test_result.csv -Djmeter.save.saveservice.output_format=csv -e -o reports/

