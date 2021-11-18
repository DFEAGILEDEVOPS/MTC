# Create Flood.i<span>o Load Test Agent - Azure Windows 2019 Server 

---

## Task Overview

- Create an Azure VM Window Server
- Install Java JDK
- Verify the Java JDK Install
- Install JMeter
- Configure JMeter Install
- Verify JMeter Install
- Install JMeter Plugins Manager
- Verify JMeter Plugins Manager Install
- Install JMeter Plugins Manager Command Line Plugin
- Verify JMeter Plugins Manager Command Line Plugin Install
- Install Flood.i<span>o Agent for Windows
- Verfiy Flood.i<span>o Agent Install
- Verfiy Flood.i<span>o Agent Load Test Execution

## Background

Flood Agent is a cross-platform agent for running Flood load generators on an organisation's own infrastructure, whether on-premise or in the cloud.
Running local Flood Agents, allows an organisation to leverage their existing infrastructure and load generator tuning expertise while at the same time benefitting from Flood's data collection pipeline, and the familiar Flood UI and Analytics platform.

## Create an Azure VM Window Server

On the Azure Portal create a new Windows VM - Windows Server 2019 Datacenter.

## Install Java JDK

On the new Windows VM navigate to the Oracle downloads website and download the Java SE Development Kit (JDK) - Version 8 Install file from https://www.oracle.com/java/technologies/downloads/#java8-windows and run the install file.

#### Note: 
Some JMeter test elements require the full Java JDK as opposed to just the Java JRE.\
\
Some JMeter Scripting Elements are not compatible with higher Java versions - 16 and above.\
\
Oracle 8 download requires creating a standard Oracle Account.
  
## Verify the Java JDK Install

Open a Windows PowerShell Command window as Administrator and run in the following command

```bat
java -version
```

Java versions should be `version "1.8.0_292"`, minor version should be `_292` or higher.

#### Note: 
In Java 8 the versioning format is 1.8.x_xxx, where 1.8 is Java Version 8.

## Install JMeter

Navigate to the Apache JMeter downloads website and download the latest version JMeter Binaries file.zip from https://jmeter.apache.org/download_JMeter.cgi and extract the zip file. In this case the latest version is  `5.4.1` and the JMeter Home Folder will be `\apache-jmeter-5.4.1\`.


#### Note: 

It is recommended to download and run the JMeter install file from the Apache JMeter website to ensure the JMeter installer uses standard installation paths as used by JMeter Third Party tools and services.

## Verify JMeter Install

To verify the JMeter Install, open PowerShell as Administrator, navigate to the Jmeter Home Folder and enter the following commands

```bat
JMeter --version
```
The latest version installed should be displayed in PowerShell.

## Configure JMeter Install

### Configure the JMETER_HOME Windows System Environment Variable

On the Windows Taskbar, search for `Edit the System Environment Variables`, select the System Properties Window, Advanced Tab, Environment Variable Button, in the System variables, Select New Button, in the Variable Name field enter `JMETER_HOME`, in the Variable value, use the Browse Directory Button to select the JMeter Home folder, `\apache-jmeter-5.4.1\`, click OK the button.

Select the Path System Variable, Select Edit Button, Select New Button, add the following path to the Path System Variables, `%JMETER_HOME%\bin`, click OK Button.

Restart the VM from the Azure Portal for the System Environment Variables change to take effect.


### Verify the JMETER_HOME Windows System Environment Variable


Open PowerShell as Administrator and enter the following command

```bat
$Env:JMETER_HOME
```

The path for the JMeter Home Directory should be displayed in PowerShell.

### Configure Java Virtual Machine (JVM) Java Heap Size

The initial memory allocated to the Java Virtual Machine (JVM) Java Heap in the JMeter application start up script is typically set at 1g and can be increased to up to a recommended 80% of the Virtual Machine Memory for better performance and to support a larger number of simulated users in the JMeter load scripts.

#### Note:

It is recommended to set both the Java Heap Minimum and Maximum Sizes to the same value to the reduce the overhead in the Java Virtual Machine actively managing the Heap Minimum.

To confirm the current JVM Java Heap Size settings, Open PowerShell as Administrator and enter the following command:

```bat\
java -XX:+PrintFlagsFinal -version | findstr /i “HeapSize PermSize ThreadStackSize”
```


To update the Java Heap Size, edit the JMeter.bat file in the `jmeter/bin` folder in notepad and search for -Xm, change the memory allocation as appropriate to the virtual machine memory sizing as below, save the file.

Java only allows k or K, m or M, and g or G after specifying the size of the heap in numbers, -Xmx1400M is valid but -Xmx1400MB is invalid heap size.


### Verify the Java Virtual Machine (JVM) Java Heap Size

The Jmeter.log file in the `jmeter/bin` folder will show an entry in the Jmeter execution log for the Java Heap Size:

`JMeter: Max memory`


## Install JMeter Plugins Manager

To install the JMeter Plugins Manager download the latest Plugins Manager JAR file from the Apache JMeter Plugins website https://JMeter-plugins.org/install/Install/ and copy to the JMeter `lib/ext` folder.

Restart JMeter for the Plugins Manager install to be completed.

## Verify JMeter Plugins Manager Install

Open JMeter in GUI mode and on the JMeter menu bar, select the Options menu and verify that the Plugin Manager menu item is shown at the bottom of the Options menu list.

Select the Plugins Manager menu item and select the Upgrades tab in the JMeter Plugin Manager Window.

The Plugins that have upgrades will be shown in the Upgrades window.

Select the `Apply Changes and Restart JMeter` button, after JMeter restarts repeat the process until no further plugin upgrades are required.




## Install JMeter Plugins Manager Command Line Utility

To support the automation of JMeter in Build and Delivery Pipelines install the Jmeter Plugins Manager Command Line Utility.

Verify the `cmdrunner-2.0.jar` or a higher version is present in `jmeter/lib` folder. If not, download from http://search.maven.org/remotecontent?filepath=kg/apc/cmdrunner/2.0/cmdrunner-2.0.jar. 

Verify that the `PluginsManagerCMD.sh` or `PluginsManagerCMD.bat` is present in the `jmeter/bin` folder. If not, run the following command to have the files created:

```bat\
java -cp jmeter/lib/ext/jmeter-plugins-manager-x.x.jar org.jmeterplugins.repository.PluginManagerCMDInstaller
```

## Verify JMeter Plugins Manager Command Line Utility Install

Run the following command to verify the JMeter Plugins Manager Command Line Utility, a list of installed plugins should be returned.

```bat\
PluginsManagerCMD status
```
#### Note:

The Status command will indicate if there are any JAR Conflicts with multiple versions of plugins, uninstall the plugin in conflict through the Plugins Manager and delete any other versions of the plugin in conflict from the JMeter `lib/ext` folder and reinstall the latest version of the plugin to resolve the conflict.

## Install Flood.i<span>o Agent for Windows

To install the Flood.i<span>o Agent for Windows download the Flood.i<span>o Agent install file from: 

https://github.com/flood-io/flood-agent/releases/download/v1.0/flood-agent-v1.0-windows-64bit.exe

Copy the flood-agent exe file to a local folder for example `c:\flood-agent`

Download the JMeter Flood Agent plugin from:

https://github.com/flood-io/flood-agent/releases/tag/v1.0

Copy the plugin JAR file to the JMeter `lib/ext` folder. Open the JMeter Plugins Manager and install the Flood Agent Plugin.

Navigate to the flood-agent local folder and run the following command to configure the agent:

```bat\
 .\flood-agent-v1.0-windows-64bit.exe configure
```

You will be asked to input your API Token, which is available on the Flood.i<span>o Web Portal under Manage your account and settings button, API Access, Reveal Token button.

 You will then be asked to input the path to the JMeter Home Folder and select to save the new configuration.

 To check the Flood Agent connection to the Flood.i<span>o Web Portal run the following command:

 ```bat\
 .\flood-agent-v1.0-windows-64bit.exe check
```

Both the API Token and JMeter configuration checks should come back as successful.


## Verfiy Flood.i<span>o Agent Install

To run the Flood Agent and verify that it is able to run tests from the Flood.i<span>o Web Portal run the following command:

```bat\
 .\flood-agent-v1.0-windows-64bit.exe --grid MTC_GRID_010
```
The Flood Agent will show the following log in the command line window, indicating that is connected successfully and ready to run a test:

```bat\
C:\flood-agent1>.\flood-agent-v1.0-windows-64bit.exe --grid MTC_GRID_010
~# Flood Agent #~
==> Proxy settings
[>] http_proxy : not set
[>] https_proxy : not set
==> Contacting Flood API...
--> checking Flood API token
[√] token valid
--> syncing with API as MTC_GRID_010
[√] sync done
==> Bootstrapping Flood agent...
[2s] ~ starting Flood Agent ~ version: 1.0 build: 4c94ba74
[4s] Using stdout-only logs
[4s][MTC_GRID_010]
[4s][MTC_GRID_010] load generator config summary
[4s][MTC_GRID_010] jmeter:
[4s][MTC_GRID_010]   execution mode  : local binary
[4s][MTC_GRID_010]     jmeter_home   : C:\apache-jmeter-5.3\
[4s][MTC_GRID_010]     jmeter_params :
[4s][MTC_GRID_010]     jvm_args      :
[4s][MTC_GRID_010]
[5s][MTC_GRID_010][job-worker] awaiting next job
[5s][MTC_GRID_010][agent] ready, awaiting Flood jobs
```

On the Flood.i<span>o Web Portal, select Streams Tab, select a Launch Flood, for Infrastructure Type select Hosted, Use your own AWS/Azure/Google Cloud account to generate load, in the Grids dropdown select the grid which was created by the Flood Agent `MTC_GRID_010`, select `Launch Test`.

#### Note:

The grid location will be set to US-east-1 by the Flood.i<span>o Web Portal.

## Verfiy Flood.i<span>o Agent Load Test Execution

The Flood Agent command line window will show the JMeter execution command run from the Flood.i<span>o Web Portal, these folders and Load Test.jmx will need to be created in the Flood Agent Directory Structure under the user profile executing the Flood Agent exe.

`C:\Users\username\AppData\Local\flood-grid\data\floods\394\files\Load-Test-.jmx`

`C:\Users\username\AppData\Local\flood-grid\data\floods\394\results\results.csv`

If the Load Test has run successfully on the Flood Agent this will be indicated on the Flood Agent command line window and the Flood.i<span>o Web Portal and the Test Results will be available on the Flood Portal.

