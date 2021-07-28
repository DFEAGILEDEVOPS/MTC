#!/bin/bash
set -e

RESOURCE_GROUP=$1
APP_SVC_PLAN=$3
IMAGE_VERSION=$5
ENV=$6

function createApp() {
  namePostfix=$1
  imageName=$2
  # create web app
  az webapp create --name "$ENV-$namePostfix" --resource-group $RESOURCE_GROUP \
    --deployment-container-image-name "$imageName:$IMAGE_VERSION" --plan $APP_SVC_PLAN
}

IFS=$'\n' # Each iteration of the for loop should read until we find an end-of-line
for row in $(cat defs.json | jq '. | map([.namePostfix, .imageName])' | jq -r @sh)
do
  # Run the row through the shell interpreter to remove enclosing double-quotes
  stripped=$(echo $row | xargs echo)

  # Call our function to process the row
  # eval must be used to interpret the spaces in $stripped as separating arguments
  eval processRow $stripped
done
unset IFS # Return IFS to its original value

