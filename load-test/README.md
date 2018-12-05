# MTC load testing

## JMeter setup
### Linux
* Run `sudo apt-get update` to refresh packages metadata
* Install JDK 7 or later
* Download JMeter 5.0: `wget -c http://www-us.apache.org/dist//jmeter/binaries/apache-jmeter-5.0.tgz`
* Unpack JMeter `tar -xf apache-jmeter-5.0.tgz`
* Ensure JMeter works by running a simple test:
`apache-jmeter-5.0/bin/./jmeter -n -t apache-jmeter-5.0/extras/Test.jmx`

### Mac OS
* Install JDK 7 or later
* Install latest JMeter using brew: `brew install jmeter`
* Run JMeter: `open /usr/local/bin/jmeter`

### Windows
* Install JDK 7 or later
* Download [JMeter 5.0](http://www-us.apache.org/dist//jmeter/binaries/apache-jmeter-5.0.tgz)
* Run `/bin/jmeter.bat` to launch JMeter


## Teacher load test data preparation
* Ensure admin application is running and the migrations have been applied
* If a password is not specified the passwords will be set to 'password'
* While in `load-test/bin` directory:
    * The following command will execute a node script which takes a password as an optional argument and will generate one teacher for each school in the database: `node generate-teacher-load-test-data.js`
    * To set a custom password (i.e. 'newpassword') run: `node generate-teacher-load-test-data.js newpassword`

### Install Jmeter Plugins - Custom JMeter Functions
* download Jmeter plugin manager
https://www.blazemeter.com/blog/how-install-jmeter-plugins-manager
* download the Custom JMeter Functions plugin
https://jmeter-plugins.org/wiki/Functions/


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
* `-Jramp` Ramp-up period  in milliseconds (ramp is the variable name used for ramp up field)
