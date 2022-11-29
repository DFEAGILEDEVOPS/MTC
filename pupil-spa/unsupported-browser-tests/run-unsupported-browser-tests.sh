#!/bin/sh -eux

# Variables
DOCKER_IMAGE_NAME='pupil-spa'
DOCKER_CONTAINER_NAME='pupil-spa-browsertest'
DOCKER_TAG="pupil-spa"
LOCAL_PORT=8181
NOW=$(date +%s)
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null && pwd )"


# Check if docker is running
if ! docker info >/dev/null 2>&1; then
    echo "Docker does not seem to be running, run it first and retry"
    exit 1
fi

# Cleanup up if the container already exists...
if [ "$(docker ps -q -f name=${DOCKER_CONTAINER_NAME})" ]; then
      # cleanup
      docker kill $DOCKER_CONTAINER_NAME
fi
if [ "$(docker ps -aq -f name=${DOCKER_CONTAINER_NAME} -f status=exited)" ]; then
      # cleanup
      docker rm $DOCKER_CONTAINER_NAME
fi

# Build the latest pupil-spa Dockerfile
cd ${SCRIPT_DIR}/../
BUILDKIT=1 docker build -t ${DOCKER_TAG} .

# start running nginx on port localhost:8181
docker run -p ${LOCAL_PORT}:80 \
-e AZURE_ACCOUNT_NAME=someaccount \
-e AUTH_URL=http://127.0.0.1:3003/auth \
-e AUTH_PING_URL=http://127.0.0.1:3003/ping \
-d \
--rm \
--name ${DOCKER_CONTAINER_NAME} \
${DOCKER_IMAGE_NAME}

# Give the docker machine time to start up
sleep 2

# Check the docker container is running
if [ "$(docker ps -q -f name=${DOCKER_CONTAINER_NAME} -f "status=exited")" ]; then
  echo "The docker container has failed to start"
  exit 1
fi

# Run the tests
yarn run jasmine ${SCRIPT_DIR}/index.spec.js

# Stop the docker container
docker kill ${DOCKER_CONTAINER_NAME}
END=$(date +%s)
PERF_SECS=$((END - NOW))

echo "browser tests passed in ${PERF_SECS} seconds"
