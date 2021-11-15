FROM stamtc/mtc-azure-functions-base:latest
RUN mkdir -p /mtc/func-throttled
WORKDIR /mtc/func-throttled
CMD yarn start
