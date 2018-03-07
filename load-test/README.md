# MTC load testing

## JMeter setup
### Linux
* Run `sudo apt-get update` to refresh packages metadata
* Install JDK 7 or later
* Download JMeter 4.0: `wget -c http://www-us.apache.org/dist//jmeter/binaries/apache-jmeter-4.0.tgz`
* Unpack JMeter `tar -xf apache-jmeter-4.0.tgz`
* Ensure JMeter works by running a simple test:
`apache-jmeter-4.0/bin/./jmeter -n -t apache-jmeter-3.0/extras/Test.jmx`

### Mac OS
* Install JDK 7 or later
* Install latest JMeter using brew: `brew install jmeter`
* Run JMeter: `open /usr/local/bin/jmeter`

### Windows
* Install JDK 7 or later
* Download [JMeter 4.0](http://www-us.apache.org/dist//jmeter/binaries/apache-jmeter-4.0.tgz)
* Run `/bin/jmeter.bat` to launch JMeter

## Pupil load test data preparation
* Ensure admin application is running and the migrations have been applied
* While in `load-test/bin` directory:
    * The following command will execute a node script which takes total schools required as an argument and will generate 60 pupils for each school: `OVERRIDE_PIN_EXPIRY=true node generate-pupil-load-test-data.js 60`
    * The following command will update `load-test/scenarios/data/pupilLogins.csv` with all the school password and pupil pin combinations required for the JMeter pupil load testing: `node extract-pins-to-csv.js`
    
## Execute pupil load test    
Assuming `jmeter` directory is placed within the load-test directory, execute the following command to run JMeter pupil check load test in CLI mode:

`` jmeter -n -t ../scenarios/mtc_pupil_check_perf_test.jmx -l reports/pupil-performance-test.csv -Djmeter.save.saveservice.output_format=csv -e -o reports/PupilHTMLReports -Jhost=localhost -Jthreads=3600 -Jramp=50
``

This command above takes the following arguments:
* -n Run in CLI mode
* -t Test file in jmx format
* -l Report to be stored in csv format
* -D Overwrites the jmeter system properties. In above command we are overwriting the property to save report in csv format
* -e Generate HTML report after load test finishes
* -o Generated HTML Report with visual outputs of the test
* -jhost Admin app Host URL (host is the variable name used in jmeter host field)
* -Jthreads Number of Threads(users) (threads is the variable name used in thread field)
* -Jramp Ramp-up period (ramp is the variable name used for ramp up field)

In order to rerun the test execute `undo-generate-pupil-load-test-data.sql` as SA to undo the test data population.

## Execute Admin load test    
Assuming `jmeter` directory is placed within the load-test directory, execute the following command to run JMeter Admin load test in CLI mode:

`` jmeter -n  -t ../scenarios/mtc_admin_login.jmx -l reports/mtc_admin_test_result.csv  -Djmeter.save.saveservice.output_format=csv -e -o reports/MTCAdminHTMLReports -Jhost=admin-as-feb-mtc-staging.azurewebsites.net -Jthreads=80 -Jramp=1600
``

This command above takes the following arguments:
* -n Run in CLI mode
* -t Test file in jmx format
* -l Report to be stored in csv format
* -D Overwrites the jmeter system properties. in above command we are overwriting the property to save report in csv format
* -e Generate HTML report after load test finishes
* -o Generated HTML Report with visual outputs of the test
* -jhost Admin app Host URL (host is the variable name used in jmeter host field)
* -Jthreads Number of Threads(users) (threads is the variable name used in thread field)
* -Jramp Ramp-up period (ramp is the variable name used for ramp up field)
