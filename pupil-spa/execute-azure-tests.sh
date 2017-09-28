#!/bin/bash -x

cd api_tests
BASE_URL=$SECURITY_TEST_URL rspec -t @azure_spa
