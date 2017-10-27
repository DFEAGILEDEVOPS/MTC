## VSTS/VSO Build Servers

Pre-reqs for ubuntu: https://github.com/Microsoft/vsts-agent/blob/master/docs/start/envubuntu.md

## Install the VSTS agent

https://www.visualstudio.com/en-gb/docs/build/actions/agents/v2-linux

``` bash
~/$ wget https://github.com/Microsoft/vsts-agent/releases/download/v2.111.1/vsts-agent-osx.10.11-x64-2.111.1.tar.gz
~/$ mkdir vstsagent && cd vstsagent
~/vstsagent$ tar zxvf ~/vsts-agent-osx.10.11-x64-2.111.1.tar.gz
```

## Service configuration

Running config.sh currently fails with: `Failed to initialize CoreCLR, HRESULT: 0x80131500`

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

If you ever update PATH this will not automatically be reflected in VSO agent metadata.  The workaround is to run run the following...

``` bash
# update the vso PATH metadata
~/vstsagent/env.sh 
# restart the vso agent service
~/vstsagent/svc.sh stop
~/vstsagent/svc.sh start
```