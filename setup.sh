#!/usr/bin/env bash
set -eu

scriptDir="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null && pwd )"
currentDir=`pwd`

export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" --no-use  # This loads nvm

# projects: admin, pupil-api, pupil-spa, tslib, func-throttled, func-consumption

mybanner ()
{
  echo "+------------------------------------------+"
  printf "| %-40s |\n" "`date`"
  echo "|                                          |"
  printf "|`tput bold` %-40s `tput sgr0`|\n" "$@"
  echo "+------------------------------------------+"
}

install_admin () {
  mybanner "Installing admin"
  cd ${scriptDir}/admin
  nvm use
  yarn
  yarn build
}

install_pupil_api () {
  mybanner "Installing pupil API"
  cd ${scriptDir}/pupil-api
  nvm use
  yarn install && yarn clean && yarn build
}

install_pupil_spa () {
  mybanner "Installing pupil SPA"
  cd ${scriptDir}/pupil-spa
  nvm use
  yarn install && yarn clean && yarn build
}

install_functions () {
  mybanner "Installing functions"
  cd ${scriptDir}/tslib
  nvm use
  yarn install && yarn clean && yarn build

  cd ${scriptDir}/func-consumption
  yarn install && yarn clean && yarn build

  cd ${scriptDir}/func-throttled
  yarn install && yarn clean && yarn build

  cd ${scriptDir}/func-ps-report
  yarn install && yarn clean && yarn build
}

install_service_bus () {
  mybanner "Installing service bus"
  cd ${scriptDir}/deploy/service-bus
  nvm use
  yarn install
}

install_db () {
  mybanner "Installing DB"
  cd ${scriptDir}/db
  nvm use
  yarn install
}

check_func_version () {
  V=$(func --version)
  echo "func version ${V} found"
  MAJOR=$(echo "$V" | cut -d . -f 1)
  if ! [[ $MAJOR -ge 4 ]]; # need 4 and above
    then mybanner "ERROR: func should be major version 4" >&2; exit 1
  fi
}

start=`date +%s`
check_func_version
install_service_bus
install_db
install_admin
install_pupil_api
install_pupil_spa
install_functions
end=`date +%s`
runtime=$((end-start))
mybanner "Packages installed and built in: ${runtime} seconds"
