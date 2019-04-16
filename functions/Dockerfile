### STAGE 1: Build ###
FROM node:10.14.1 as builder

SHELL ["/bin/bash", "-c"]

WORKDIR /func-app
COPY . .
RUN yarn install

RUN apt-get update && \
    apt-get install libunwind8 && \
    curl -O https://dot.net/v1/dotnet-install.sh && \
    source dotnet-install.sh --channel Current && \
    rm dotnet-install.sh && \
    npm i -g azure-functions-core-tools@core --unsafe-perm true && \
    func extensions install

### STAGE 2: functions runtime image ###
FROM mcr.microsoft.com/azure-functions/node:2.0

ENV AzureWebJobsScriptRoot=/home/site/wwwroot
ENV SQL_ENCRYPT=0
COPY --from=builder /func-app /home/site/wwwroot
