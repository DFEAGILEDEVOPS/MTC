#!/usr/bin/env bash

set -x
set -e

if [ -z "$FREETDS_VERSION" ]; then
  FREETDS_VERSION="1.00.80"
fi

wget http://www.freetds.org/files/stable/freetds-$FREETDS_VERSION.tar.gz
tar -xzf freetds-$FREETDS_VERSION.tar.gz
cd freetds-$FREETDS_VERSION
./configure --prefix=/opt/local \
            --with-openssl=/opt/local \
            --with-tdsver=7.3
make
make install
cd ..
rm -rf freetds-$FREETDS_VERSION
rm freetds-$FREETDS_VERSION.tar.gz