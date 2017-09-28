#!/bin/bash -x

cd ../api_tests
gem install bundler
bundle install
BASE_URL=$SECURITY_TEST_URL rspec -t @azure_spa
