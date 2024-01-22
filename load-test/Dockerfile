FROM alpine:3.19

ENV FLOOD_TOKEN=""
ENV FLOOD_GRID="mtc-grid"

RUN apk add --no-cache curl
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
RUN curl -L https://github.com/flood-io/flood-agent/releases/download/v1.0/flood-agent-v1.0-linux-64bit > flood-agent
RUN chmod +x flood-agent

CMD ["/bin/sh", "-c", "./flood-agent --token ${FLOOD_TOKEN} --grid ${FLOOD_GRID}"]
