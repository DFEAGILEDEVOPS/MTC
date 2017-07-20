Installing and Running MTC tests
================================

This is a short guide to installing and running the MTC tests.  

##Clone the tests

```bash
git clone https://agilefactory.visualstudio.com/DefaultCollection/MTC/_git/app
```

##Install RVM stable with ruby

Follow installation instructions for installing RVM here:

https://rvm.io/rvm/install
 
Once rvm is installed, we need ruby version 2.4.0, to install use the following:
 `rvm install 2.4.0`
 
Use ruby version 2.4.0 and set it as your default:
 `rvm use 2.4.0 --default`

##Installing required gems

Go to the folder /test and run the following commands:

`gem install bundler` and then `bundle install`

These two commands will install all the gems that the tests need.

## Running the tests

To run the tests with the default options ( headless and app running on localhost:3000 ) give the command below:

`cucumber`
 
 The above command runs the tests headless & sequentially in one process on url 'http://localhost:3000'

If you want to run the tests in chrome:

`cucumber DRIVER=chrome`

If you want to run a particular test, then tag the scenario with a tag like @test and run:

`cucumber -t @test`

If you want to run the tests on a different url:

`cucumber BASE_URL='https://check-development.herokuapp.com'`


If you want to run the tests in parallel to save time:
 
 `parallel_cucumber features/ -n 4 -o "-p parallel" `
 
 The above command will run the tests headless in 4 processes ( -n option) and uses the 'parallel' profile defined in config/cucumber.yml file.
 Html reports are generated in report folder with names as report.html, report1.html, report2.html, report3.html ( one html report per process)
 
If you want to change the url while executing parallel tests ( use the -o option in parallel gem to give cucumber command line options):
 
 `parallel_cucumber features/ -n 4 -o "-p parallel BASE_URL=‘https://check-development.herokuapp.com’"`
 
If you want to run a set of tests in parallel tagged with a tag for example @smoke:
 
 `parallel_cucumber features/ -n 2 -o "-p parallel_chrome -t @smoke"`

If you want to run in Browserstack, please run the following to get a list of available browsers: 

`rake -T`

This will return a list, just cut and paste the browser of your choice and run the command. For example: 

`rake bs_capitan_chrome_58 BS_USER=XXXX BS_KEY=XXXX` 

If your want to run a specific feature, you can like:

`rake bs_capitan_chrome_58 BS_USER=XXXX BS_KEY=XXXX OPTS='features/prototype.feature'`

Please note this feature is still under development (awaiting browserstack support), as there are some issues with the integration. There maybe some failures, in this case please
test manually and report to a QA for investigation. 
