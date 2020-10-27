#!/usr/bin/env bash

set -eux
scriptDir="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null && pwd )"
cd $scriptDir

# setup nvm
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" --no-use  # This loads nvm

# run the tests
cd ../admin
nvm use
yarn test
yarn test:integration

cd ../pupil-spa
nvm use
yarn test-single

cd ../pupil-api
nvm use
yarn clean
yarn test

cd ../tslib
nvm use
yarn clean
yarn test
yarn tests:integration

# reset node version
echo
echo
nvm use
