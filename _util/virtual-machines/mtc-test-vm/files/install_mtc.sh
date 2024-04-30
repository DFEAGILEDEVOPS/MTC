#!/bin/zsh

set -e
set SOURCE_TRACE
# set XTRACE

cd $HOME

# Install single-user rvm + ruby

# Install ruby
sudo apt-get -y install gnupg2
gpg2 --keyserver hkp://keys.gnupg.net --recv-keys 409B6B1796C275462A1703113804BB82D39DC0E3 7D2BAF1CF37B13E2069D6956105BD0E739499BDB
\curl -sSL https://get.rvm.io | bash -s stable
source ~/.rvm/scripts/rvm
rvm install 2.4
rvm use ruby-2.4 --default
gem install bundler

# Set up nvm
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" --no-use  # This loads nvm

git clone https://github.com/DFEAGILEDEVOPS/MTC.git
cd MTC

# get the variables from the user
echo
echo
echo "Setting up MTC Environment"
echo
echo
echo -n "Enter AZURE_STORAGE_CONNECTION_STRING "
read AzureStorageConnectionString
echo
echo -n "Enter AZURE_SERVICE_BUS_CONNECTION_STRING "
read  AzureServiceBusConnectionString
echo


cat > .env  << ENV
# DEBUG_VERBOSITY=2
# LOG_LEVEL='debug'
AZURE_SERVICE_BUS_CONNECTION_STRING='${AzureServiceBusConnectionString}'
AZURE_STORAGE_CONNECTION_STRING='${AzureStorageConnectionString}'
CORS_WHITELIST='http://localhost:4200'
NODE_ENV=test
OVERRIDE_PIN_EXPIRY=true
SQL_PUPIL_CENSUS_USER_PASSWORD='Mtc-D3v.5ql_S3rv3r'
ENV
echo ".env file created"

cat > ./func-consumption/local.settings.json << FC
{
  "IsEncrypted": false,
  "Values": {
    "FUNCTIONS_WORKER_RUNTIME": "node",
    "AzureWebJobsStorage": "${AzureStorageConnectionString}",
    "AZURE_STORAGE_CONNECTION_STRING": "${AzureStorageConnectionString}",
    "ServiceBusConnection": "${AzureServiceBusConnectionString}",
    "CORS_WHITELIST": "http://localhost:4200"
  },
  "ConnectionStrings": {}
}
FC
echo "func-consumption/local.settings.json created"

cat > ./functions-app/local.setttings.json << FA
{
  "IsEncrypted": false,
  "Values": {
    "FUNCTIONS_WORKER_RUNTIME": "node",
    "AZURE_STORAGE_CONNECTION_STRING": "${AzureStorageConnectionString}",
    "AzureWebJobsStorage": "${AzureStorageConnectionString}"
  }
}
FA
echo "functions-app/local.settings.json created"

# Install node version and yarn
NODE_VERSIONS=$(find . -name '.nvmrc' | grep -v 'node_modules' | xargs cat | sort | uniq)
# zsh syntax here to split on newline
for version in ${(ps|\n|)NODE_VERSIONS}
do
	nvm install "$version"
	nvm use "$version"
	npm i -g yarn azure-functions-core-tools
done


# Get the app ready to run
echo "Install yarn and ruby dependencies"
cd ~/MTC/deploy/service-bus && nvm use && yarn install --frozen-lockfile
cd ~/MTC/admin && nvm use && yarn install --frozen-lockfile
cd ~/MTC/pupil-spa && nvm use && yarn install --frozen-lockfile
cd ~/MTC/pupil-api && nvm use && yarn install --frozen-lockfile
cd ~/MTC/func-consumption && nvm use && yarn install --frozen-lockfile
cd ~/MTC/functions-app && nvm use && yarn install --frozen-lockfile
cd ~/MTC/test/admin-hpa && bundle install
cd ~/MTC/test/pupil-hpa && bundle install

echo "All Done - installed versions to follow"
echo -n "rvm version: "
rvm --version

echo -n "ruby version "
ruby --version

echo -n "nvm version "
nvm --version

echo -n "node versions "
nvm ls

echo -n "dotnet version "
dotnet --version

echo -n "azure functions core tools version "
func --version


#eof
