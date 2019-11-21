#!/usr/bin/env bash

PR_ID=14135
PR_URL="https://api.github.com/repos/dfeagiledevops/mtc/pulls/$PR_ID"
echo "looking up PR at $PR_URL"
CURL_RESPONSE=$(curl -s $PR_URL | jq '.labels[] | select(.id==861719997) | .id')
echo "response is $CURL_RESPONSE"
if [ "$CURL_RESPONSE" -ne "861719997" ]; then
   exit 1;
fi
