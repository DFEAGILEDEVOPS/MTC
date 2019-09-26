### STAGE 1: Build ###
FROM node:10.14.1

SHELL ["/bin/bash", "-c"]

RUN mkdir -p /func-app
WORKDIR /func-app
COPY . .

RUN apt-get update && \
    apt-get install libunwind8 && \
    curl -O https://dot.net/v1/dotnet-install.sh && \
    source dotnet-install.sh --channel 2.2 && \
    rm dotnet-install.sh && \
    npm i -g azure-functions-core-tools@core --unsafe-perm true && \
    func extensions install

RUN yarn install

RUN chmod +x wait-admin-app.sh

CMD ./wait-admin-app.sh && yarn start
