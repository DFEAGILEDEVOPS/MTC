## VSTS/VSO Build Servers

Pre-reqs for ubuntu: https://github.com/Microsoft/vsts-agent/blob/master/docs/start/envubuntu.md

## Pre-reqs for MTC

### Install dependent services

Install the following...
- [docker](https://docs.docker.com/v17.09/engine/installation/linux/docker-ce/ubuntu/)
  - add build user to docker user group `sudo usermod -a -G docker $USER`
- [docker-compose](https://docs.docker.com/v17.09/engine/installation/linux/docker-ce/ubuntu/)
- [nvm](https://github.com/creationix/nvm#installation-and-update)
- [yarn](https://yarnpkg.com/lang/en/docs/install/#debian-stable)
- [Azure CLI](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli?view=azure-cli-latest)
- [rvm](https://github.com/rvm/ubuntu_rvm)
  - add build user to rvm user group `sudo usermod -a -G rvm $USER`
- [Open SSL libraries](https://websiteforstudents.com/manually-install-the-latest-openssl-toolkit-on-ubuntu-16-04-18-04-lts/)
- [zip](https://www.luminanetworks.com/docs-lsc-610/Topics/SDN_Controller_Software_Installation_Guide/Appendix/Installing_Zip_and_Unzip_for_Ubuntu_1.html)
- [dotnet](https://dotnet.microsoft.com/download/linux-package-manager/ubuntu18-04/sdk-current)
- [Azure Functions Core Tools](https://github.com/Azure/azure-functions-core-tools)

### Install FreeTDS for ruby SQL driver

execute `admin/bin/install-freetds.sh` on the build server.

### Install google chrome for ruby headless automation tests

```bash
wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
sudo apt -y install ./google-chrome*.deb
```

## Install the VSTS agent

Go to the agents page in VSO, click the download button, and choose the linux option.
It will give you instructions on how to install the agent.

## Service configuration

run the configuration tool

``` bash
~/vstsagent$ ./config.sh
```

You will be asked for the following...

*URL:* https://myhost.visualstudio.com

*PAT (Personal access token):* can be found in your account security section

Configure the agent to [run as a service](https://docs.microsoft.com/en-us/azure/devops/pipelines/agents/v2-linux?view=azure-devops)

## Known issues

- retained docker images can fill up the disks regularly.  run `docker system prune -a -f` to purge

- Running config.sh can fail with: `Failed to initialize CoreCLR, HRESULT: 0x80131500`

This is due to compatibility issues with the icu library v55 on 16.04.
To install v52 run the following...

``` bash
wget http://security.ubuntu.com/ubuntu/pool/main/i/icu/libicu52_52.1-8ubuntu0.2_amd64.deb
sudo dpkg -i libicu52_52.1-8ubuntu0.2_amd64.deb
```

### PATH updates

If you ever update PATH this will not automatically be reflected in VSO agent metadata.  The workaround is to run the following...

``` bash
# update the vso PATH metadata
~/vstsagent/env.sh
# restart the vso agent service
~/vstsagent/svc.sh stop
~/vstsagent/svc.sh start
```

The above should all now be documented in the official VSTS agent area.  Use the above as a rough guide only.
