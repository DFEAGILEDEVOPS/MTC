#!/bin/bash
set -eu

############################################################################
# checks out a branch
# builds containers for each app in the service
# starts them up via compose (will need to use branch name as a tag?)
# executes ruby tests against them
# the machine on which this executes will need the following env vars...
# AZURE_SERVICE_BUS_CONNECTION_STRING
# AZURE_STORAGE_CONNECTION_STRING
############################################################################

scriptDir="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null && pwd )"
dockerTagPrefix="mtcregression"
dockerLabel=$1
deployDir="$( dirname $scriptDir)"
mtcRoot="$( dirname $deployDir)"
echo "mtc root is $mtcRoot"

export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" --no-use  # This loads nvm

scriptbanner ()
{
  echo "+--------------------------------------------------------------------+"
  printf "| %-66s |\n" "`date`"
  echo "|                                                                    |"
  printf "|`tput bold` %-66s `tput sgr0`|\n" "$@"
  echo "+--------------------------------------------------------------------+"
}

install_throttled_functions () {
  scriptbanner "Installing throttled functions"
  cd ${mtcRoot}/func-throttled
  nvm use
  yarn clean
  yarn install
  yarn build
}

install_consumption_functions () {
  scriptbanner "Installing consumption functions"
  cd ${mtcRoot}/func-consumption
  nvm use
  yarn clean
  yarn install
  yarn build
}

run_compose () {
  docker compose up --build
}

start=`date +%s`
install_consumption_functions
install_throttled_functions
run_compose
end=`date +%s`
runtime=$((end-start))
scriptbanner "Packages installed and built in: ${runtime} seconds"
