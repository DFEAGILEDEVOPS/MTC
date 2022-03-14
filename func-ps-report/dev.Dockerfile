FROM stamtc/mtc-azure-functions-base:latest
RUN mkdir -p /mtc/func-ps-report
WORKDIR /mtc/func-ps-report
CMD yarn start
