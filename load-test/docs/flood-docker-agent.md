# Flood Agent in Docker

source: [https://hub.docker.com/r/floodio/jmeter](https://hub.docker.com/r/floodio/jmeter)

```bash
docker pull floodio/jmeter
```

## Steps
fire up some container instances on azure...

```bash
az container create -g $RESOURCE_GROUP --name $AGENT_NAME --cpu 4 --memory 8 --image floodio/jmeter:5.4.1 --environment-variables ???
```

## TODO: what args do we pass into the container for the flood agent?
