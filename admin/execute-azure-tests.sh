#!/bin/bash -x

cd api_tests
BASE_URL=https://admin-as-dev-mtc.azurewebsites.net rspec -t @azure_admin