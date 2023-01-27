#!/bin/bash --login
set -e
echo "running browser security tests with tag $2 against site $1"
export PATH="/home/builduser/.rbenv/shims:${PATH}"
gem install bundler -v 2.1.4
bundle install
BASE_URL=$1 bundle exec rspec -t $2
