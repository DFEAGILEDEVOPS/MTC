#!/bin/bash
set -e

RES_GRP=$1
LOCATION=$2
ENV=$3
SUFFIX=$4

NAME="$ENV-ai-$SUFFIX"

# requires Azure CLI 2.0.79 or above to work
# installs the add-on if it does not yet exist
az monitor app-insights component -a $NAME -g $RES_GRP -l $LOCATION --query-access Disabled

exit 0

# TODO connect to azure functions and web apps
# list web apps into a json object via jq
az webapp list -o json -g rg-t1dv-mtc --query "[].name" | jq '.[]' | xargs -L1
# then call the following for each web app
az monitor app-insights component connect-webapp -g $RES_GRP -a $NAME --web-app $WEBAPP1

az monitor app-insights component connect-function -g $RES_GRP -a $NAME --function $FUNC1

# OR - get the app insights instrumentation key, and apply it as an app setting
