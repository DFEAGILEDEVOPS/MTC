FROM alpine:3

ENV FLOOD_TOKEN=""
ENV FLOOD_GRID="mtc-grid"

RUN apk add --no-cache curl
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
RUN curl -L https://github.com/flood-io/flood-agent/releases/download/v1.0/flood-agent-v1.0-linux-64bit > flood-agent
RUN chmod +x flood-agent
COPY ./docker-start.sh .
RUN chmod +x docker-start.sh

CMD ["/bin/sh", "-c", "./flood-agent --token ${FLOOD_TOKEN} --grid ${FLOOD_GRID}"]
