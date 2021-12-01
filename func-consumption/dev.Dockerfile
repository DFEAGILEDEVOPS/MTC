FROM stamtc/mtc-azure-functions-base:latest
RUN mkdir -p /mtc/func-consumption
WORKDIR /mtc/func-consumption
CMD yarn start
