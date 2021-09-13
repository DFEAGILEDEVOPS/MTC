#!/bin/bash
set -e

if [ -z "$1" ]
  then
    echo "azure resource group name required for $0"
    exit 1
fi

if [ -z "$2" ]
  then
    echo "azure location name required for $0"
    exit 1
fi

if [ -z "$3" ]
  then
    echo "target environment name required (typically dev, preprod or prod) for $0"
    exit 1
fi

if [ -z "$4" ]
  then
    echo "target environment suffix required (typically product/service name) for $0"
    exit 1
fi

if [ -z "$5" ]
  then
    echo "fully qualified domain name required for $0"
    exit 1
fi

RES_GRP=$1
LOCATION=$2
ENV=$3
SUFFIX=$4
FQDN=$5

# front-door is an azure CLI extension that must be explicitly installed
az extension add --name front-door

FD_NAME="$ENV-fd-$SUFFIX"
WAF_NAME="${ENV}wafpolicy${SUFFIX}"

echo "creating web application firewall policy $WAF_NAME"
# https://docs.microsoft.com/en-us/cli/azure/network/front-door/waf-policy?view=azure-cli-latest#az_network_front_door_waf_policy_create
az network front-door waf-policy create -o none -g $RES_GRP -n $WAF_NAME

echo "creating front door $FD_NAME"
# https://docs.microsoft.com/en-us/cli/azure/network/front-door?view=azure-cli-latest#az_network_front_door_create
az network front-door create -o none -g $RES_GRP -n $FD_NAME --backend-address $FQDN --accepted-protocols Https --forwarding-protocol HttpOnly \
  --no-wait
