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

echo "creating web application firewall policy $WAF_NAME"
# https://docs.microsoft.com/en-us/cli/azure/network/front-door/waf-policy?view=azure-cli-latest#az_network_front_door_waf_policy_create
az network front-door waf-policy create -o none -g $RES_GRP -n $WAF_NAME

echo "creating front door $FD_NAME"
# https://docs.microsoft.com/en-us/cli/azure/network/front-door?view=azure-cli-latest#az_network_front_door_create
az network front-door create -o none -g $RES_GRP -n $FD_NAME --backend-address $FQDN --accepted-protocols Https --forwarding-protocol HttpOnly \
  --no-wait
