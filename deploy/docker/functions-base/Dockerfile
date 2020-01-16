FROM node:10.14.1

SHELL ["/bin/bash", "-c"]

RUN apt-get update && \
    apt-get install libunwind8 && \
    curl -LO https://dot.net/v1/dotnet-install.sh && \
    source dotnet-install.sh --channel 2.2 && \
    rm dotnet-install.sh && \
    yarn global add azure-functions-core-tools@core --unsafe-perm true
