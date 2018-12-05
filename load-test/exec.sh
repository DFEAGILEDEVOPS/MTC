#!/bin/bash

# exit on error
set -e

jmeter -n -t ../scenarios/mtc_admin_login.jmx -l reports/mtc_admin_test_result.csv -Djmeter.save.saveservice.output_format=csv -e -o reports/MTCAdminHTMLReports -Jhost=admin-as-feb-mtc-staging.azurewebsites.net -Jthreads=80 -Jramp=1600
