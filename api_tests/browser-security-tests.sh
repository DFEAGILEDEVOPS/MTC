#!/bin/bash -x

gem install bundler
bundle install
echo "checking security headers against $1"
BASE_URL=$1 rspec -t $2
