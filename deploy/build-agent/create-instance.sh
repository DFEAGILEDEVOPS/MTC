#!/bin/bash
set -e

AGENT_NAME=$1
RESOURCE_GROUP=$2
AZP_TOKEN=$3
AZP_URL=$4

az container create -g $RESOURCE_GROUP --name $AGENT_NAME --image stamtc/devops-build-agent:latest \
  --environment-variables AZP_TOKEN=$AZP_TOKEN AZP_AGENT_NAME=$AGENT_NAME AZP_POOL=MTC AZP_URL=$AZP_URL \
  --cpu 4 --memory 8
