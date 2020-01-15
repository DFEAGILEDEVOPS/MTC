### DO NOT RUN THIS FILE DIRECTLY
### execute ../run-docker-compose-travis.sh in order to ensure tslib dependencies are copied in prior to build
FROM node:10.14.1

SHELL ["/bin/bash", "-c"]

RUN mkdir -p /func-app
WORKDIR /func-app
COPY . .

RUN apt-get update && \
    apt-get install libunwind8 && \
    curl -LO https://dot.net/v1/dotnet-install.sh && \
    source dotnet-install.sh --channel 2.2 && \
    rm dotnet-install.sh && \
    yarn global add azure-functions-core-tools@core --unsafe-perm true && \
    func extensions install

RUN yarn install

RUN chmod +x wait-admin-app.sh

CMD ./wait-admin-app.sh && yarn start
