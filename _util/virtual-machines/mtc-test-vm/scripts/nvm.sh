#!/bin/sh -eux

# Install nvm
curl -O -s https://raw.githubusercontent.com/nvm-sh/nvm/v0.35.2/install.sh
chmod +x ./install.sh
su $SUDO_USER -c './install.sh'
rm -f ${HOME_DIR}/install.sh
