FROM node:10.14.1

SHELL ["/bin/bash", "-c"]

# RUN apt-get update && \
#     apt-get install libunwind8 && \
#     curl -LO https://dot.net/v1/dotnet-install.sh && \
#     source dotnet-install.sh --channel 2.2 && \
#     rm dotnet-install.sh && \
#     yarn global add azure-functions-core-tools@core --unsafe-perm true

RUN apt-get update && \
    apt-get install apt-transport-https && \
    apt-get update

RUN wget -qO- https://packages.microsoft.com/keys/microsoft.asc | gpg --dearmor > microsoft.asc.gpg && \
    mv microsoft.asc.gpg /etc/apt/trusted.gpg.d/ && \
    wget -q https://packages.microsoft.com/config/debian/9/prod.list && \
    mv prod.list /etc/apt/sources.list.d/microsoft-prod.list && \
    chown root:root /etc/apt/trusted.gpg.d/microsoft.asc.gpg && \
    chown root:root /etc/apt/sources.list.d/microsoft-prod.list

RUN apt-get update && apt-get install dotnet-sdk-2.2 -y && \
    yarn global add azure-functions-core-tools@core --unsafe-perm true
