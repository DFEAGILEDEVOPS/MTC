#!/usr/bin/env bash

mybanner ()
{
  echo "+------------------------------------------+"
  printf "| %-40s |\n" "`date`"
  echo "|                                          |"
  printf "|`tput bold` %-40s `tput sgr0`|\n" "$@"
  echo "+------------------------------------------+"
}

set -eu

scriptDir="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null && pwd )"
cd $scriptDir

# setup nvm
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" --no-use  # This loads nvm

# run the tests
mybanner 'Testing admin'
cd ../admin
nvm use
yarn test
yarn test:integration
yarn test:frontend

mybanner 'Testing SPA'
cd ../pupil-spa
nvm use
yarn test-single
mybanner 'SPA Unsupported browser tests'
yarn runUnsupportedBrowserTests

mybanner 'Testing TSLIB'
cd ../tslib
nvm use
# yarn clean
yarn test
yarn tests:integration

mybanner "tests passed ok"

# reset node version
echo
echo
nvm use
