# MTC Flood Agent in Docker

Creating our own Docker image for the flood agent allows us to run our own grid of flood agents on azure within container instances.

## 1. Build and publish the image

source: [./../Dockerfile](./../Dockerfile)

```bash
# build the image
docker build . -t mtc-flood-agent
# run a container instance of the image locally
docker run --env FLOOD_TOKEN="flood_xxx_yyy_zzz" flood-mtc
```

## 2. Creating container instances
Specify preferred values for CPU and Memory and ensure you provide your flood API token.

```bash
az container create -g $RESOURCE_GROUP --name $AGENT_NAME --cpu 4 --memory 8 --image floodio/jmeter:5.4.1 --cpu 4 --memory 8 --environment-variables FLOOD_TOKEN="your_flood_token" FLOOD_GRID="optional, use default if preferred"
```

## 3. Instantiate a load test on flood.io
[Official documentation](https://guides.flood.io/infrastructure/standalone-infrastructure/flood-agent)
