# MTC load testing

## JMeter setup
### Linux
* Run `sudo apt-get update` to refresh packages metadata
* Install JDK 7 or later
* Download JMeter 4: `wget -c http://www-us.apache.org/dist/jmeter/binaries/apache-jmeter-4.0.tgz`
* Unpack JMeter `tar -xf apache-jmeter-4.0.tgz`
* Ensure JMeter works by running a simple test:
`apache-jmeter-4.0/bin/./jmeter -n -t apache-jmeter-4.0/extras/Test.jmx`

### Mac OS
* Install JDK 7 or later
* Install v4 JMeter by downloading and installing to preferred location (typically `~/jmeter4/`)
* set up a symlink in `/usr/local/bin/` that points to the executable (typically `~/jmeter4/bin/jmeter`)
* Run JMeter from terminal `> jmeter4`

### Windows
* Install JDK 7 or later
* Download [JMeter 4.0](http://www-us.apache.org/dist/jmeter/binaries/apache-jmeter-4.0.tgz)
* Run `/bin/jmeter.bat` to launch JMeter

### Install Jmeter Plugins - Custom JMeter Functions (optional, not required)
* download Jmeter plugin manager
https://www.blazemeter.com/blog/how-install-jmeter-plugins-manager
* download the Custom JMeter Functions plugin
https://jmeter-plugins.org/wiki/Functions/

## Best practices
* **Launch Jmeter executable from this directory** this will ensure that any output files from local test runs are created under this directory.
* **Use a HTTP defaults item for each scenario** You can specify defaults for protocol, port & hostname for the target and parameterise each property.  This ensures you do not have to set them for each request.
* **Do not hardcode data** It does not work at scale.  Instead use tools such as the XPath extractor to find elements in web pages and obtain record IDs from the value property (see the `admin-generate-pins.jmx` scenario as an example).
* **Use the Debug Sampler for local scenario development** Use it to output variables and other useful information after a local test run.  This can help you see what data / parameters / values are being produced at runtime.
* **Run a small load test locally after making changes**  The JMeter UI can handle running 1-5 user load on a local instance of the app.  The UI can sometimes be flaky, but its useful for viewing results and debug sampler information as you build out your scenarios.  If you encounter issues with the UI, run from the command line.


## General environment preparation
### Initialise storage services
Execute `./start.sh` to clear storage account contents, start SQL Server Docker instance, execute migrations and seed default data set.
* **NOTE**: in order to successfully clear storage account contents, you must have the `AZURE_STORAGE_CONNECTION_STRING` variable set for the admin app.  Either in a `.env` file or as environment variable.
### Start the admin application
start the admin app with `yarn start`

## common parameters

- **adminAppHost** the domain of the admin app, defaults to `localhost`
- **port** the port of the admin app, defaults to `3001`
- **protocol** the protocol of the admin app, defaults to `http`
- threads
- rampup
- duration
- pupilApiHost
- pupilApiPort
- proxyFunctionHost
- proxyFunctionPort




## Seed load test data (non-local test only)
The scenarios have low defaults (2 users) so they can be executed quickly in a local environment.  However, when performing load test at scale you will want to seed the database with a high volume of users (teachers) and pupils
* From the `load-test` directory:
    * Execute: `node bin/generate-teacher-for-each-school.js` to generate a teacher for each school (will not overwrite existing ones)
    * Execute: `node bin/generate-pupil-data.js` to generate 40 pupils for each school

## Pupil load test data preparation
* Ensure admin application is running and the migrations have been applied
* The following command will execute a node script which takes the number of pupils as an argument and will generate pupils spread across the schools in the database
    * While in the `load-test` directory:
    * `node bin/generate-pupil-load-test-data.js 700000`
* The following command will update `load-test/scenarios/data/pupilLogins.csv` with all the school password and pupil pin combinations required for the JMeter pupil load testing:
    * While in the `load-test` directory:
    * `node bin/extract-pins-to-csv.js`

## Execute pupil load test
* Assuming `jmeter` directory is placed within the load-test directory, execute the following command to run JMeter pupil check load test in CLI mode
* mkdir reports
``* jmeter -n -t ./scenarios/mtc_pupil_check_perf_test.jmx -l reports/pupil-performance-test.csv -Djmeter.save.saveservice.output_format=csv -e -o reports/PupilHTMLReports -JpupilApiHost=localhost -Jthreads=3600 -Jramp=50
``

This command above takes the following arguments:
* `-n` Run in CLI mode
* `-t` Test file in jmx format
* `-l` Report to be stored in csv format
* `-D` Overwrites the jmeter system properties. In above command we are overwriting the property to save report in csv format
* `-e` Generate HTML report after load test finishes
* `-o` Generated HTML Report with visual outputs of the test
* `-JpupilApiHost` Admin app Host URL (pupilApiHost is the variable name used in jmeter host field)
* `-Jthreads` Number of Threads(users) (threads is the variable name used in thread field)
* `-Jramp` Ramp-up period in milliseconds (ramp is the variable name used for ramp up field)

In order to rerun the test execute `undo-generate-pupil-load-test-data.sql` as SA to undo the test data population.

## Execute Admin load test
Assuming `jmeter` directory is placed within the load-test directory, execute the following command to run JMeter Admin load test in CLI mode:

`` jmeter -n  -t ../scenarios/mtc_admin_login.jmx -l reports/mtc_admin_test_result.csv  -Djmeter.save.saveservice.output_format=csv -e -o reports/MTCAdminHTMLReports -JadminAppHost=admin-as-feb-mtc-staging.azurewebsites.net -Jthreads=80 -Jramp=1600
``

This command above takes the following arguments:
* `-n` Run in CLI mode
* `-t` Test file in jmx format
* `-l` Report to be stored in csv format
* `-D` Overwrites the jmeter system properties. in above command we are overwriting the property to save report in csv format
* `-e` Generate HTML report after load test finishes
* `-o` Generated HTML Report with visual outputs of the test
* `-JadminAppHost` Admin app Host URL (adminAppHost is the variable name used in jmeter host field)
* `-Jthreads` Number of Threads(users) (threads is the variable name used in thread field)
* `-Jramp` Ramp-up period  in seconds (ramp is the variable name used for ramp up field)
