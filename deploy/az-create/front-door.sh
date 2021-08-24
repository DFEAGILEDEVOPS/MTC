#!/bin/bash
set -e

RES_GRP=$1
LOCATION=$2
ENV=$3
SUFFIX=$4
FQDN=$5

# front-door is an azure CLI extension that must be explicitly installed
az extension add --name front-door

FD_NAME="$ENV-fd-$SUFFIX"
WAF_NAME="$ENV-wafpolicy-$SUFFIX"

# create waf policy
az network front-door waf-policy create -o none -g $RES_GRP -n $WAF_NAME

az network front-door create -o none -g $RES_GRP -n $FD_NAME --backend-address $FQDN --accepted-protocols Https --forwarding-protocol HttpOnly \
  --no-wait
