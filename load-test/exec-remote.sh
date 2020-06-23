#!/bin/bash
set -e

# web service protocol
WEB_PROTOCOL='https'
# web service port
WEB_PORT=443

# name of stream to run
FLOOD_NAME=$1
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


# Check we have the jq binary to make parsing JSON responses a bit easier
command -v jq >/dev/null 2>&1 || \
{ echo >&2 "Please install http://stedolan.github.io/jq/download/  Aborting."; exit 1; }

# Start a flood
echo
echo "[$(date +%FT%T)+00:00] Starting flood"
flood_uuid=$(curl -H "Accept: application/vnd.flood.v2+json" -u $FLOOD_API_TOKEN: -X POST https://api.flood.io/floods \
-F "flood[tool]=jmeter" \
-F "flood[threads]=20" \
-F "flood[project]=MTC" \
#-F "flood[privacy]=public" \
-F "flood[name]=$FLOOD_NAME" \
#-F "flood_files[]=@data.csv" \
-F "flood_files[]=@scenarios/_2020/live-long-teacher-journey-with-check-submit.jmx" \
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
curl --silent --user $FLOOD_API_TOKEN: https://api.flood.io/floods/$flood_uuid/result.csv > flood-result.csv
