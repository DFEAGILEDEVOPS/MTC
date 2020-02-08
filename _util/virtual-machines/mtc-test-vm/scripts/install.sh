#!/bin/sh -eux
export DEBIAN_FRONTEND=noninteractive

apt-get -y install \
chromium-browser   \
freetds-common     \
freetds-dev        \
zsh
