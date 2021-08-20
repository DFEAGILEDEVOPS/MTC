#!/bin/bash
set -e

RES_GRP=$1
LOCATION=$2
ENV=$3
SUFFIX=$4
FQDN=$5

NAME="$ENV-fd-$SUFFIX"

az network front-door create -o none -g $RES_GRP -n $NAME --backend-address $FQDN --accepted-protocols https --forwarding-protocol HttpOnly \
  
