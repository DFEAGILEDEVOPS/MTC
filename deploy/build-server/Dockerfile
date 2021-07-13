FROM ubuntu:18.04

USER root
SHELL ["/bin/bash", "-c"]
# To make it easier for build and release pipelines to run apt-get,
# configure apt to not require confirmation (assume the -y argument by default)
ENV DEBIAN_FRONTEND=noninteractive
RUN echo "APT::Get::Assume-Yes \"true\";" > /etc/apt/apt.conf.d/90assumeyes

RUN apt-get update && apt-get install -y --no-install-recommends \
    apt-transport-https \
    ca-certificates \
    curl \
    freetds-bin \
    git \
    gnupg2 \
    iputils-ping \
    jq \
    libcurl4 \
    libicu60 \
    libssl1.0 \
    libunwind8 \
    lsb-release \
    netcat \
    software-properties-common \
    wget \
    && rm -rf /var/lib/apt/lists/*

# install azure CLI
RUN curl -LsS https://aka.ms/InstallAzureCLIDeb | bash \
  && rm -rf /var/lib/apt/lists/*

# install docker
RUN curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg2 --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
RUN echo \
  "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
RUN apt-get update && apt-get install docker-ce docker-ce-cli containerd.io

# Install nvm and current node runtimes
ENV NVM_DIR /root/.nvm
ENV NODE_VERSION 12.18.2

# Install nvm with node and npm
RUN curl -sL https://raw.githubusercontent.com/creationix/nvm/v0.38.0/install.sh | bash \
  && . $NVM_DIR/nvm.sh \
  && nvm install $NODE_VERSION \
  && nvm install 10.14.1 \
  && nvm alias default $NODE_VERSION

# Install Ruby via brightbox
RUN apt-add-repository ppa:brightbox/ruby-ng
RUN apt-get update
RUN apt-get install ruby2.6

# Install dotnet
RUN wget https://packages.microsoft.com/config/ubuntu/18.04/packages-microsoft-prod.deb -O packages-microsoft-prod.deb
RUN dpkg -i packages-microsoft-prod.deb
RUN rm packages-microsoft-prod.deb
RUN apt-get update && apt-get install -y dotnet-runtime-5.0
# replace with dotnet-sdk-5.0 for full SDK (not currently required)

ARG TARGETARCH=amd64
ARG AGENT_VERSION=2.185.1

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

ENTRYPOINT [ "./start.sh" ]
