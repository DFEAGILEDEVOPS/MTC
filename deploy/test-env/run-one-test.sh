#!/usr/bin/env bash

cd ./../admin/test
gem install bundler
bundle install
rake features OPTS='BASE_URL=$(TEST_SITE_URL) MONGO_CONNECTION_STRING=$(TEST_DATABASE_CONNECTION) features/sign_in.feature'
CUCUMBER_EXIT_CODE=$?
exit ${CUCUMBER_EXIT_CODE}