#!/bin/bash --login -x
echo "path is.... $PATH"
rvm use 2.4.0
echo "running browser security tests with tag $2 against site $1"
gem install bundler
bundle install
BASE_URL=$1 rspec -t $2
