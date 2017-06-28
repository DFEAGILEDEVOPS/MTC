We have 2 build servers, we started with Windows and are now moving to Ubuntu 16.04 due to compatibility issues with some ruby dependencies.  Namely the phantomjs gem.

There is an issue open on github, which has never been closed...
https://github.com/colszowka/phantomjs-gem/pull/69

Both build servers are azure VMs.

Pre-reqs for ubuntu: https://github.com/Microsoft/vsts-agent/blob/master/docs/start/envubuntu.md

## Install

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

*URL:* Root VSO URL (AgileFactory)

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

### running phantomJS against a local node web server

The test.sh script runs `node server.js &` to fire up a non blocking node web server process for the app, which is then killed once the tests are complete.  Running `npm start &` was troublesome as node is spawned as a separate process.