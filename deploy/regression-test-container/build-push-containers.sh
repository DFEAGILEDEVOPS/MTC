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

build_admin_image () {
  imageName="$dockerTagPrefix/admin:$dockerLabel"
  scriptbanner "building docker image - $imageName"
  cd "${mtcRoot}/admin"
  docker build -t $imageName .
}

build_db_image () {
  imageName="$dockerTagPrefix/db:$dockerLabel"
  scriptbanner "building docker image - $imageName"
  cd "${mtcRoot}/db"
  docker build -t $imageName -f dev.Dockerfile .
}

build_api_image () {
  imageName="$dockerTagPrefix/api:$dockerLabel"
  scriptbanner "building docker image - $imageName"
  cd "${mtcRoot}/pupil-api"
  docker build -t $imageName .
}

build_spa_image () {
  imageName="$dockerTagPrefix/spa:$dockerLabel"
  scriptbanner "building docker image - $imageName"
  cd "${mtcRoot}/pupil-spa"
  docker build -t $imageName .
}

install_throttled_functions () {
  scriptbanner "Installing throttled functions"
  cd ${mtcRoot}/func-throttled
  nvm use
  yarn clean
  yarn install
  yarn build
}

build_throttled_functions_image () {
  imageName="$dockerTagPrefix/throttled-functions:$dockerLabel"
  scriptbanner "building docker image - $imageName"
  cd "${mtcRoot}/func-throttled"
  docker build -t $imageName -f test.Dockerfile .
}

install_consumption_functions () {
  scriptbanner "Installing consumption functions"
  cd ${mtcRoot}/func-consumption
  nvm use
  yarn clean
  yarn install
  yarn build
}

build_consumption_functions_image () {
  imageName="$dockerTagPrefix/consumption-functions:$dockerLabel"
  scriptbanner "building docker image - $imageName"
  cd "${mtcRoot}/func-consumption"
  docker build -t $imageName -f test.Dockerfile .
}

start=`date +%s`
build_db_image
build_admin_image
build_api_image
build_spa_image
install_consumption_functions
build_consumption_functions_image
install_throttled_functions
build_throttled_functions_image
end=`date +%s`
runtime=$((end-start))
scriptbanner "Packages installed and built in: ${runtime} seconds"
