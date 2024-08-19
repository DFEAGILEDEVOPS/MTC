# Cribbed from https://hub.docker.com/r/samuelmarks/mssql-server-fts-sqlpackage-linux/
FROM ubuntu:xenial-20210416

RUN apt-get update -qq && \
  apt-get install -y curl apt-transport-https software-properties-common locales

RUN echo DOTNET_CLI_TELEMETRY_OPTOUT=1 >> /etc/environment
RUN locale-gen en_US.UTF-8 && \
  printf 'LANGUAGE=en_US.UTF-8\nLC_ALL=en_US.UTF-8\n' >> /etc/default/locale

RUN mkdir -p /opt/downloads
WORKDIR /opt/downloads

RUN curl -q https://packages.microsoft.com/config/ubuntu/16.04/packages-microsoft-prod.deb -O
RUN dpkg -i packages-microsoft-prod.deb

RUN curl https://packages.microsoft.com/keys/microsoft.asc | apt-key add -
RUN add-apt-repository "$(curl https://packages.microsoft.com/config/ubuntu/16.04/mssql-server-2017.list)"
RUN add-apt-repository "$(curl https://packages.microsoft.com/config/ubuntu/16.04/prod.list)"
RUN apt-get update -qq && \
  ACCEPT_EULA=Y apt-get install -y unzip dotnet-sdk-2.1 mssql-server-fts mssql-tools unixodbc-dev
RUN echo PATH="$PATH:/opt/mssql-tools/bin" >> ~/.bash_profile
RUN echo 'export PATH="$PATH:/opt/mssql-tools/bin"' >> ~/.bashrc

RUN curl -Lq https://go.microsoft.com/fwlink/?linkid=873926 -o sqlpackage-linux-x64-latest.zip
RUN ls -alh
RUN unzip sqlpackage-linux-x64-latest.zip -d /opt/sqlpackage

EXPOSE 1433/tcp

CMD /opt/mssql/bin/sqlservr