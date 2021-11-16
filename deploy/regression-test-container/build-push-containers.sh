#!/bin/bash
set -eu

############################################################################
# checks out a branch
# builds containers for each app in the service
# starts them up via compose (will need to use branch name as a tag?)
# executes ruby tests against them
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

# install and build admin app, ready for docker
install_admin () {
  scriptbanner "Installing admin"
  cd "${mtcRoot}/admin"
  nvm use
  yarn clean
  yarn install
  yarn build
}

build_admin_image () {
  adminImageName="$dockerTagPrefix/admin:$dockerLabel"
  scriptbanner "building docker image:$adminImageName"
  cd "${mtcRoot}/admin"
  docker build -t $adminImageName .
}

start=`date +%s`
install_admin
build_admin_image
end=`date +%s`
runtime=$((end-start))
scriptbanner "Packages installed and built in: ${runtime} seconds"
