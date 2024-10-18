# custom build agent for Azure Devops pipelines
# https://github.com/microsoft/azure-pipelines-agent
# see readme.md for usage

FROM ubuntu:22.04

ENV RUBY_VERSION=3.2.2
ENV AZURE_FUNCTIONS_CORE_TOOLS_VERSION=4

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
    iputils-ping \
    jq \
    libcurl4 \
    libssl1.0 \
    libunwind8 \
    netcat \
    # ruby -> free-tds
    build-essential \
    freetds-bin \
    freetds-dev \
    libreadline-dev \
    libssl-dev \
    unixodbc \
    zlib1g-dev \
    # ruby -> chrome
    fonts-liberation \
    libasound2 \
    libatk1.0-0 \
    libatspi2.0-0 \
    libc6 \
    libcairo2 \
    libcups2 \
    libdrm2 \
    libexpat1 \
    libgbm1 \
    libglib2.0-0 \
    libgtk-3-0 \
    libnspr4 \
    libpango-1.0-0 \
    libu2f-udev \
    libvulkan1 \
    libx11-6 \
    libxcb1 \
    libxcomposite1 \
    libxdamage1 \
    libxext6 \
    libxfixes3 \
    libxkbcommon0 \
    libxrandr2 \
    wget \
    xdg-utils \
    # dotnet, powershell
    apt-transport-https \
    # dotnet, azure functions core tools
    lsb-release \
    # azure functions core tools
    gnupg2 \
    # ruby (via brightbox), powershell
    software-properties-common \
    # rbenv specifics
    autoconf \
    bison \
    libffi-dev \
    libgdbm-dev \
    libncurses5-dev \
    libyaml-dev \
    libnss3 \
    tzdata \
    # for zipping up function apps
    zip \
    && rm -rf /var/lib/apt/lists/*


# install chromium
RUN apt-get update && apt-get install -y chromium-browser

# install azure CLI for Azure Devops Agent & build tasks
RUN curl -LsS https://aka.ms/InstallAzureCLIDeb | bash \
  && rm -rf /var/lib/apt/lists/*

# install dotnet & powershell
RUN apt-get update && apt-get install -y dotnet-sdk-7.0

# powershell
# Update the list of packages
RUN apt-get update
# Download the Microsoft repository GPG keys
RUN wget -q "https://packages.microsoft.com/config/ubuntu/$(lsb_release -rs)/packages-microsoft-prod.deb"
# Register the Microsoft repository GPG keys
RUN dpkg -i packages-microsoft-prod.deb
# Delete the the Microsoft repository GPG keys file
RUN rm packages-microsoft-prod.deb
# Update the list of packages after we added packages.microsoft.com
RUN apt-get update
# Install PowerShell
RUN apt-get install -y powershell

# install azure functions core tools
RUN curl https://packages.microsoft.com/keys/microsoft.asc | gpg2 --dearmor > microsoft.gpg
RUN mv microsoft.gpg /etc/apt/trusted.gpg.d/microsoft.gpg
RUN echo "deb [arch=amd64] https://packages.microsoft.com/repos/microsoft-ubuntu-$(lsb_release -cs)-prod $(lsb_release -cs) main" \
  > /etc/apt/sources.list.d/dotnetdev.list
RUN apt-get update && apt-get install azure-functions-core-tools-$AZURE_FUNCTIONS_CORE_TOOLS_VERSION

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

# install ruby via rbenv (new for 2023, experimental)
RUN echo 'export PATH="/home/$BUILD_USER/.rbenv/bin:$PATH"' >> /home/$BUILD_USER/.bashrc
RUN curl -fsSL https://github.com/rbenv/rbenv-installer/raw/HEAD/bin/rbenv-installer | bash
RUN echo 'eval "$(rbenv init -)"' >> /home/$BUILD_USER/.bashrc
RUN cat /home/$BUILD_USER/.bashrc
ENV PATH=$PATH:/home/$BUILD_USER/.rbenv/bin
# not needed
# RUN rbenv init -
RUN rbenv install $RUBY_VERSION
RUN rbenv global $RUBY_VERSION

# set up ruby environment for user
RUN mkdir -p ~/gems
RUN echo "export GEM_HOME=~/gems" >> ~/.profile
RUN echo "export GEM_PATH=$GEM_HOME:/usr/local/lib/ruby/gems/$RUBY_VERSION" >> ~/.profile

# install nvm and current node runtimes
ENV NVM_DIR=/home/$BUILD_USER/.nvm
ENV CURRENT_NODE_VERSION=20.18.0
ENV PREVIOUS_NODE_VERSION=18.12.1

RUN curl -sL https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash \
  && . $NVM_DIR/nvm.sh \
  && nvm install $CURRENT_NODE_VERSION \
  && nvm install $PREVIOUS_NODE_VERSION \
  && nvm alias default $CURRENT_NODE_VERSION

# install azuredevops agent service
# https://github.com/microsoft/azure-pipelines-agent/releases
ARG TARGETARCH=amd64
ARG AGENT_VERSION=3.241.0

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
