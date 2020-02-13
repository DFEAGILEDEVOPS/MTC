#!/bin/sh -eux

# Install dotnet
curl -O -s https://packages.microsoft.com/config/ubuntu/18.04/packages-microsoft-prod.deb
dpkg -i packages-microsoft-prod.deb
add-apt-repository universe
apt-get -y update
apt-get -y install apt-transport-https
apt-get -y update
apt-get -y install dotnet-sdk-2.2
rm -f packages-microsoft-prod.deb
