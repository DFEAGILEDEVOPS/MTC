#!/bin/sh -eux
export DEBIAN_FRONTEND=noninteractive
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
apt-get -y update
add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"
apt-get -y install docker-ce docker-compose
usermod -a -G docker mtc
rm -f ${HOME_DIR}/packages-microsoft-prod.deb
