#!/bin/bash --login
set -e
source ~/.profile
echo "running browser security tests with tag $2 against site $1"
gem install bundler -v 1.16.6
bundle install
BASE_URL=$1 bundle exec rspec -t $2
