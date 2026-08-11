FROM mcr.microsoft.com/azure-functions/node:4-node20
RUN npm install -g yarn azure-functions-core-tools@4 --unsafe-perm true
RUN mkdir -p /mtc/func-throttled
WORKDIR /mtc/func-throttled
CMD yarn start
