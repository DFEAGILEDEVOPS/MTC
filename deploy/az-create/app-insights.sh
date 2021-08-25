#!/bin/bash
set -e

RES_GRP=$1
LOCATION=$2
ENV=$3
SUFFIX=$4

NAME="$ENV-ai-$SUFFIX"

# requires Azure CLI 2.0.79 or above to work
# https://docs.microsoft.com/en-us/cli/azure/monitor/app-insights?view=azure-cli-latest
az extension add --name application-insights

echo "creating application insights instance $NAME"
az monitor app-insights component create -o none -a $NAME -g $RES_GRP -l $LOCATION --query-access Disabled

# TODO connect to azure functions and web apps
# list web apps into a json object via jq
# az webapp list -o json -g rg-t1dv-mtc --query "[].name" | jq '.[]' | xargs -L1
# then call the following for each web app
# az monitor app-insights component connect-webapp -g $RES_GRP -a $NAME --web-app $WEBAPP1

# az monitor app-insights component connect-function -g $RES_GRP -a $NAME --function $FUNC1

# OR - get the app insights instrumentation key, and apply it as an app setting
