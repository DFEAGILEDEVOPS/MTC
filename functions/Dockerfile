FROM mcr.microsoft.com/azure-functions/node:2.0

# RUN apt-get update && apt-get install -y dotnet-sdk-2.1

RUN npm i -g azure-functions-core-tools@core --unsafe-perm true

ENV AzureWebJobsScriptRoot=/home/site/wwwroot

WORKDIR /home/site/wwwroot
COPY . .

RUN func extensions install
