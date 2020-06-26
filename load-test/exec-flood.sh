#!/bin/bash
set -e

# name of stream to run
FLOOD_NAME=${1:AzureDevOps_Pipeline}
# Flood Api auth token
FLOOD_API_TOKEN=$2
# admin app url
ADMIN_APP_HOST=$3
# pupil api url
PUPIL_API_HOST=$4
# pupil api port
# pupil spa host (for CORS on pupil api)
PUPIL_SPA_HOST=$5
# check submit proxy function host
CHECK_SUBMIT_HOST=$6
# check submit proxy auth token
CHECK_SUBMIT_AUTH_TOKEN=$7
# web service protocol
WEB_PROTOCOL=${8:-https}
# web service port
WEB_PORT=${9:-443}

# Check we have the jq binary to make parsing JSON responses a bit easier
command -v jq >/dev/null 2>&1 || \
{ echo >&2 "Please install http://stedolan.github.io/jq/download/  Aborting."; exit 1; }

echo
echo "preparing to execute $FLOOD_NAME"
echo "admin app:${WEB_PROTOCOL}://${ADMIN_APP_HOST}:${WEB_PORT}"
echo "pupil api host:${WEB_PROTOCOL}://${PUPIL_API_HOST}:${WEB_PORT}"
echo "pupil spa (for api cors):${WEB_PROTOCOL}://$PUPIL_SPA_HOST}:${WEB_PORT}"
echo "check submit host:${WEB_PROTOCOL}://${CHECK_SUBMIT_HOST}:${WEB_PORT}"

# Start a flood
echo
echo "[$(date +%FT%T)+00:00] Starting flood"
flood_uuid=$(curl -u $FLOOD_API_TOKEN: -X POST https://api.flood.io/floods \
-F "flood[tool]=jmeter" \
-F "flood[threads]=20" \
-F "flood[project]=MTC" \
-F "flood[name]=$FLOOD_NAME" \
-F "flood_files[]=@./scenarios/_2020/live-long-teacher-journey-with-check-submit.jmx" \
-F "flood[override_parameters]=-JadminAppHost=${ADMIN_APP_HOST}, -Jprotocol=${WEB_PROTOCOL}, -Jport=${WEB_PORT}, -JpupilApiHost=${PUPIL_API_HOST}, -JproxyFunctionHost=${CHECK_SUBMIT_HOST}, -JpupilSiteUrl=${PUPIL_SPA_HOST}" \
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
flood_report=$(curl --silent --user $FLOOD_API_TOKEN: https://api.flood.io/floods/$flood_uuid/report | \
  jq -r ".summary")

echo
echo "[$(date +%FT%T)+00:00] Detailed results at https://flood.io/$flood_uuid"
echo "$flood_report"

# Optionally store the CSV results
echo
echo "[$(date +%FT%T)+00:00] Storing CSV results at flood-result.csv"
curl --silent --user $FLOOD_API_TOKEN: https://api.flood.io/floods/$flood_uuid/results.csv > ${flood_uuid}-flood-result.csv
