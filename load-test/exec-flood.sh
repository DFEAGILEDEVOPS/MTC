#!/bin/bash
set -e

# name of stream to run
FLOOD_NAME=${1:CICD_PinGen_LiveCheck_Submit}
# Flood Api auth token
FLOOD_API_TOKEN=$2
# admin app url
ADMIN_APP_DOMAIN=$3
# admin app port
ADMIN_APP_PORT=${4:-443}
# pupil api url
PUPIL_API_DOMAIN=$5
# pupil api port
PUPIL_API_PORT=${6:-443}
# storage account queue domain for posting messages
STORAGE_ACCOUNT_QUEUE_DOMAIN=$7
# check submit proxy function host
FUNC_CONS_DOMAIN=$8
# func cons port
FUNC_CONS_PORT=${9:-7071}
# auth key to execute functions
FUNC_CONS_AUTH_TOKEN=$10
# thread count
THREAD_COUNT=${11:-5}
# project name
PROJECT_NAME=${12:-MTC}

# Check we have the jq binary to make parsing JSON responses a little easier
command -v jq >/dev/null 2>&1 || \
{ echo >&2 "Please install http://stedolan.github.io/jq/download/  Aborting."; exit 1; }

echo
echo "preparing to execute $FLOOD_NAME"
echo "admin app:https://${ADMIN_APP_DOMAIN}"
echo "pupil api host:https://${PUPIL_API_DOMAIN}"
echo "pupil spa (for api cors):https://$PUPIL_SPA_DOMAIN}"
echo "consumption functions host:https://${FUNC_CONS_DOMAIN}:${FUNC_CONS_PORT}"

# Start a flood
echo
echo "[$(date +%FT%T)+00:00] Starting flood"
flood_uuid=$(curl -u $FLOOD_API_TOKEN: -X POST https://api.flood.io/floods \
-F "flood[tool]=jmeter" \
-F "flood[threads]=$THREAD_COUNT" \
-F "flood[project]=$PROJECT_NAME" \
-F "flood[name]=$FLOOD_NAME" \
-F "flood_files[]=@./scenarios/live-check-journey.jmx" \
-F "flood[override_parameters]=-JadminAppHost=${ADMIN_APP_DOMAIN}, -Jprotocol=https, -Jport=${ADMIN_APP_PORT}, -JpupilApiHost=${PUPIL_API_DOMAIN}," \
" -JpupilApiPort=${PUPIL_API_PORT}, -JFuncConsHost=${FUNC_CONS_DOMAIN}, -JFuncConsPort=${FUNC_CONS_PORT}, -storageAccountHost=${STORAGE_ACCOUNT_QUEUE_DOMAIN}" \
-F "flood[grids][][infrastructure]=demand" \
-F "flood[grids][][instance_quantity]=1" \
-F "flood[grids][][region]=uk-south-london" \
-F "flood[grids][][instance_type]=m5.xlarge" \
-F "flood[grids][][stop_after]=15" | jq -r ".uuid")

# Wait for flood to finish
echo "[$(date +%FT%T)+00:00] Waiting for flood $flood_uuid"
while [ $(curl --silent --user $FLOOD_API_TOKEN: https://api.flood.io/floods/$flood_uuid | \
  jq -r '.status == "finished"') = "false" ]; do
  echo -n "."
  sleep 3
done

# Get the summary report
flood_report=$(curl --silent --user $FLOOD_API_TOKEN: https://api.flood.io/floods/$flood_uuid/report)

flood_summary=$(echo $flood_report | jq -r ".summary")
mean_response_time=$(echo $flood_report | jq -r ".mean_response_time")

echo
echo "[$(date +%FT%T)+00:00] Detailed results at https://flood.io/$flood_uuid"
echo "[$(date +%FT%T)+00:00] $flood_summary"
echo
echo "mean response time: $mean_response_time"
