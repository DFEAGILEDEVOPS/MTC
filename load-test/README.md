# MTC load testing

## JMeter setup

We use JMeter 5, as this is now the default for flood.io

### MacOS
* Install JDK 8 or later
* Install v5 JMeter...
* via Homebrew: `brew install jmeter`
* via Download: download the [official installer](https://jmeter.apache.org/download_jmeter.cgi_)
* Run JMeter from terminal `> jmeter`

### Linux
* Run `sudo apt-get update` to refresh packages metadata
* Install JDK 7 or later
* Download JMeter 5: `wget -c http://www-us.apache.org/dist/jmeter/binaries/apache-jmeter-5.3.tgz`
* Unpack JMeter `tar -xf apache-jmeter-5.3.tgz`
* Ensure JMeter works by running a simple test:
`apache-jmeter-5.3/bin/jmeter -n -t apache-jmeter-5.3/extras/Test.jmx`

### Windows
* Install JDK 8 or later
* Download the [official installer](https://jmeter.apache.org/download_jmeter.cgi_)

### Install Jmeter Plugins - Custom JMeter Functions (optional, not required)
* you can install the [Plugin Manager](https://www.blazemeter.com/blog/how-install-jmeter-plugins-manager)
* Browse [custom plugins](https://jmeter-plugins.org/wiki/Functions/)

## Best practices
* **Launch Jmeter executable from this directory** this will ensure that any output files from local test runs are created under this directory.
* **Use a HTTP defaults item for each scenario** You can specify defaults for protocol, port & hostname for the target and parameterise each property.  This ensures you do not have to set them for each request.
* **Do not hardcode data** It does not work at scale.  Instead use tools such as the XPath extractor to find elements in web pages and obtain record IDs from the value property.
* **Use the Debug Sampler for local scenario development** Use it to output variables and other useful information after a local test run.  This can help you see what data / parameters / values are being produced at runtime.
* **Run a small load test locally after making changes**  The JMeter UI can handle running 1-5 user load on a local instance of the app.  The UI can sometimes be flaky, but its useful for viewing results and debug sampler information as you build out your scenarios.  If you encounter issues with the UI, run from the command line.
**Passing parameters when running locally** You can pass parameters to JMeter via the command line with the `J` prefix - `> jmeter -JmyCustomParam=value`.


## General environment preparation

### Initialise storage services
Execute `./start.sh` to clear storage account contents, start SQL Server Docker instance, execute migrations and seed default data set.
* **NOTE**: in order to successfully clear storage account contents, you must have the `AZURE_STORAGE_CONNECTION_STRING` variable set for the admin app.  Either in a `.env` file or as environment variable.
### Start all applications

Typically, you will need all services running..

Admin app - `/admin` runs on 3001
Pupil api - `/pupil-api` runs on 3003
core functions - `/func-consumption` runs on 7071

If the scenario you are running submits checks, you will need the proxy function running.
check submit proxy - `/load-test/check-submit-proxy` runs on 7073

## common parameters

Running Jmeter from the command line...
* `-n` Run in CLI mode
* `-t` Test file in jmx format
* `-l` Report to be stored in csv format
* `-D` Overwrites the jmeter system properties. In above command we are overwriting the property to save report in csv format
* `-e` Generate HTML report after load test finishes
* `-o` Generated HTML Report with visual outputs of the test
* `-JmyCustomParam` an example custom parameter that you use in your scenarios
* `-Jthreads` Number of Threads(users) (threads is the variable name used in thread field)
* `-Jramp` Ramp-up period in milliseconds (ramp is the variable name used for ramp up field)

MTC Specific parameters, commonly used in the jmx files...

- **`adminAppHost`** the domain of the admin app. defaults to `localhost`
- **`duration`** test run duration, in seconds. defaults to 300 (5 minutes)
- **`port`** the port of the admin app. defaults to `3001`
- **`protocol`** the protocol of the admin app. defaults to `http`
- **`proxyFunctionHost`** the domain of the function proxy api. defaults to `localhost`
- **`proxyFunctionPort`** the port of the function proxy api. defaults to `7073`
- **`pupilApiHost`** the domain of the pupil auth Api. defaults to `localhost`
- **`pupilApiPort`** the port of the pupil auth Api. defaults to `3003`
- **`funcConsHost`** the domain of the consumption functions API. defaults to `localhost`
- **`funcConsPort`** the port of the consumption functions API. defaults to `7071`
- **`storageAccountHost`** host for Azure storage queues
- **`rampup`** ramp up period, in seconds. defaults to 5
- **`threads`** number of threads to run. defaults to 5
- **`waitTimeMs`** the time to wait in milliseconds at each defined pause step. defaults to `5000`

# Data seeding
If you are running a local run of 5 users or less (useful for debugging jmx scenarios) you do not need to pre-load the system as 5 users are created with the default seeding as part of `/start.sh`.

For a set of 100 schools, with 300 pupils each and one teacher, run `./prep-local-db.sh` prior to the test run.

# Run a Local test
Run `./exec-local.sh` to run a local load test of 5 users.  See the script source for requirements.

## Additional load test scripts (for remote environment setups)
**Some of these are pre 2020, and may no longer work as-is.**

### Seed load test data (non-local test only)
The scenarios have low defaults (2 users) so they can be executed quickly in a local environment.  However, when performing load test at scale you will want to seed the database with a high volume of users (teachers) and pupils
* From the `load-test` directory:
    * Execute: `node bin/generate-teacher-for-each-school.js` to generate a teacher for each school (will not overwrite existing ones)
    * Execute: `node bin/generate-pupil-data.js` to generate 40 pupils for each school

### Pupil data preparation
* Ensure admin application is running and the migrations have been applied
* The following command will execute a node script which takes the number of pupils as an argument and will generate pupils spread across the schools in the database
    * While in the `load-test` directory:
    * `node bin/generate-pupil-load-test-data.js 700000`
* The following command will update `load-test/scenarios/data/pupilLogins.csv` with all the school password and pupil pin combinations required for the JMeter pupil load testing:
    * While in the `load-test` directory:
    * `node bin/extract-pins-to-csv.js`
