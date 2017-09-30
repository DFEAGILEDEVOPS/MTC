#!/bin/bash -x

cd ../api_tests
gem install bundler
bundle install
echo "checking security headers against $SECURITY_TEST_URL"
BASE_URL=$SECURITY_TEST_URL rspec -t @azure_admin