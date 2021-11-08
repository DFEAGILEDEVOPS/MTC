#!/usr/bin/env bash
set -e
# Stop and start the MTC infrastructure in a new docker container with a fresh DB and purged queues

echo "Restarting all infrastructure"
scriptDir="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null && pwd )"
${scriptDir}/stop.sh
${scriptDir}/start.sh
