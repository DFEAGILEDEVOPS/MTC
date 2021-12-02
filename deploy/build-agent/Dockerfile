FROM stamtc/ruby-builder:latest

# to make it easier for build and release pipelines to run apt-get,
# configure apt to not require confirmation (assume the -y argument by default)
ENV DEBIAN_FRONTEND=noninteractive
RUN echo "APT::Get::Assume-Yes \"true\";" > /etc/apt/apt.conf.d/90assumeyes

# core dependencies
RUN apt-get update && \
    apt-get upgrade -y --force-yes && \
    apt-get install -y --no-install-recommends \
    # azure devops agent
    ca-certificates \
    curl \
    git \
    jq \
    iputils-ping \
    libcurl4 \
    libicu66 \
    libssl1.0 \
    libunwind8 \
    netcat \
    # ruby -> free-tds
    freetds-bin \
    freetds-dev \
    build-essential \
    libssl-dev \
    libreadline-dev \
    zlib1g-dev \
    unixodbc \
    # ruby -> chrome
    wget \
    # dotnet, powershell
    apt-transport-https \
    # dotnet, azure functions core tools
    lsb-release \
    # azure functions core tools
    gnupg2 \
    # ruby (via brightbox), powershell
    software-properties-common \
    # for zipping up function apps
    zip \
    && rm -rf /var/lib/apt/lists/*

# install google chrome 'the right way'
RUN wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add -
RUN echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list
RUN apt update && apt install -y google-chrome-stable

# install azure CLI for Azure Devops Agent & build tasks
RUN curl -LsS https://aka.ms/InstallAzureCLIDeb | bash \
  && rm -rf /var/lib/apt/lists/*

# download and register microsoft repo GPG keys & products (for dotnet & powershell)
RUN curl https://packages.microsoft.com/config/ubuntu/20.04/packages-microsoft-prod.deb --output packages-microsoft-prod.deb
RUN dpkg -i packages-microsoft-prod.deb
RUN rm packages-microsoft-prod.deb

# install dotnet
RUN apt-get update && apt-get install -y dotnet-sdk-5.0

# install powershell
RUN add-apt-repository universe && apt-get install -y powershell

# install azure functions core tools
RUN curl https://packages.microsoft.com/keys/microsoft.asc | gpg2 --dearmor > microsoft.gpg
RUN mv microsoft.gpg /etc/apt/trusted.gpg.d/microsoft.gpg
RUN echo "deb [arch=amd64] https://packages.microsoft.com/repos/microsoft-ubuntu-$(lsb_release -cs)-prod $(lsb_release -cs) main" \
  > /etc/apt/sources.list.d/dotnetdev.list
RUN apt-get update && apt-get install azure-functions-core-tools-3

# install yarn
RUN curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add -
RUN echo "deb https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list
RUN apt update && apt install --no-install-recommends yarn

# system installs are complete at this point.

# create user
ENV BUILD_USER=builduser
RUN mkdir /azp
RUN adduser --disabled-password $BUILD_USER && chown -R $BUILD_USER /azp

USER $BUILD_USER
SHELL ["/bin/bash", "-l", "-c"]

# set up ruby environment for user
RUN mkdir -p ~/gems
RUN echo "export GEM_HOME=~/gems" >> ~/.profile
RUN echo "export GEM_PATH=$GEM_HOME:/usr/local/lib/ruby/gems/2.6.0" >> ~/.profile

# install nvm and current node runtimes
ENV NVM_DIR=/home/$BUILD_USER/.nvm
ENV CURRENT_NODE_VERSION=14.18.1
ENV PREVIOUS_NODE_VERSION=12.18.2

RUN curl -sL https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash \
  && . $NVM_DIR/nvm.sh \
  && nvm install $CURRENT_NODE_VERSION \
  && nvm install $PREVIOUS_NODE_VERSION \
  && nvm alias default $CURRENT_NODE_VERSION

# install azuredevops agent service
# https://github.com/microsoft/azure-pipelines-agent/releases
ARG TARGETARCH=amd64
ARG AGENT_VERSION=2.194.0

WORKDIR /azp
RUN if [ "$TARGETARCH" = "amd64" ]; then \
      AZP_AGENTPACKAGE_URL=https://vstsagentpackage.azureedge.net/agent/${AGENT_VERSION}/vsts-agent-linux-x64-${AGENT_VERSION}.tar.gz; \
    else \
      AZP_AGENTPACKAGE_URL=https://vstsagentpackage.azureedge.net/agent/${AGENT_VERSION}/vsts-agent-linux-${TARGETARCH}-${AGENT_VERSION}.tar.gz; \
    fi; \
    curl -LsS "$AZP_AGENTPACKAGE_URL" | tar -xz

COPY ./start.sh .

USER root
RUN chmod +x start.sh
COPY ./cleanup.sh .
RUN ./cleanup.sh
RUN rm ./cleanup.sh

USER $BUILD_USER

ENTRYPOINT [ "./start.sh" ]
