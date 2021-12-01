FROM mtc-azure-functions-base:latest
RUN mkdir -p /mtc/functions-app
WORKDIR /mtc/functions-app
RUN func extensions install
CMD yarn start
