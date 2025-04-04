#!/usr/bin/env bash

# $1 - the id of the Pull Request
# allows a build task to fail fast if the relevant Github PR label is not present
# returns none zero exit code if label not found

PR_ID=$1
PR_URL="https://api.github.com/repos/dfeagiledevops/mtc/pulls/$PR_ID"
echo "looking up PR at $PR_URL"
CURL_RESPONSE=$(curl -s $PR_URL | jq '.labels[] | select(.id==861719997) | .id')
echo "response is $CURL_RESPONSE"
if [ "$CURL_RESPONSE" != "861719997" ]
then
  exit 1;
fi
