### DO NOT RUN THIS FILE DIRECTLY
### execute ../run-docker-compose-travis.sh in order to ensure tslib dependencies are copied in prior to build
FROM baldy/mtc-azure-functions-base:latest

SHELL ["/bin/bash", "-c"]

RUN mkdir -p /func-app
WORKDIR /func-app
COPY . .

RUN func extensions install
CMD yarn start
