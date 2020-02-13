#!/bin/sh -eux

# Install MTC project
cp /var/tmp/install_mtc.sh $HOME/install_mtc.sh
chmod +x ./install_mtc.sh
chown ${SUDO_USER}:${SUDO_USER} ./install_mtc.sh
rm -f /usr/local/install_mtc.sh
