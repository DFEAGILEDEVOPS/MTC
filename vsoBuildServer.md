## VSTS/VSO Build Servers

Pre-reqs for ubuntu: https://github.com/Microsoft/vsts-agent/blob/master/docs/start/envubuntu.md

## Pre-reqs for MTC

Install docker
** check to see if docker works.  if you get a permissions error, run the following...
``` bash
sudo usermod -a -G docker $USER
```
Install docker-compose if installing docker alone does not include it.
Install nvm
Install yarn
[Install Azure CLI 2.0](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli?view=azure-cli-latest)

## Install the VSTS agent

Go to the agents page in VSO, click the download button, and choose the linux option.
It will give you instructions on how to install the agent.

## Service configuration

Running config.sh can fail with: `Failed to initialize CoreCLR, HRESULT: 0x80131500`

This is due to compatibility issues with the icu library v55 on 16.04.
To install v52 run the following...

``` bash
wget http://security.ubuntu.com/ubuntu/pool/main/i/icu/libicu52_52.1-8ubuntu0.2_amd64.deb
sudo dpkg -i libicu52_52.1-8ubuntu0.2_amd64.deb
```

Now you can continue with the documented steps...

run the configuration tool

``` bash
~/vstsagent$ ./config.sh
```

You will be asked for the following...

*URL:* https://myhost.visualstudio.com

*PAT (Personal access token):* can be found in your account security section

The agent should be configured to run as a service...

https://github.com/Microsoft/vsts-agent/blob/master/docs/start/svcsystemd.md

## Known issues

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