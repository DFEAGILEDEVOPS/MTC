Installing and Running MTC tests
================================

This is a short guide to installing and running the MTC tests.  

##Clone the tests

```bash
git clone git@github.com:DFEAGILEDEVOPS/MTC.git
```

##Install RVM stable with ruby

Follow installation instructions for installing RVM here:

https://rvm.io/rvm/install
 
Once rvm is installed, we need ruby version 2.4.0, to install use the following:
 `rvm install 2.4.0`
 
Use ruby version 2.3.3 and set it as your default:
 `rvm use 2.4.0 --default`

##Installing required gems

Go to the folder /test/admin-hpa and run the following commands:

`gem install bundler` and then `bundle install`

These two commands will install all the gems that the tests need.

## Running the tests

To run in BrowserStack mode, please enter you username and password to the root .env file in the following format:

```
BROWSERSTACK_ACCESS_KEY=XYZ
BROWSERSTACK_USERNAME=xyz
``` 

#####Basic

To run the tests with the default options ( headless and app running on localhost:3001 ) give the command below:

`cucumber`
 
 The above command runs the tests headless & sequentially in one process on url 'http://localhost:3001'

If you want to run the tests in chrome:

`cucumber DRIVER=chrome`

If you want to run a particular test, then tag the scenario with a tag like @test and run:

`cucumber -t @test`

If you want to run the tests on a different url:

`cucumber ADMIN_BASE_URL='https://check-development.herokuapp.com'`

#####Parallel

If you want to run the tests in parallel to save time:
 
 `parallel_cucumber features/ -n 4 -o "-p parallel" `
 
 The above command will run the tests headless in 4 processes ( -n option) and uses the 'parallel' profile defined in config/cucumber.yml file.
 Html reports are generated in report folder with names as report.html, report1.html, report2.html, report3.html ( one html report per process)
 
If you want to change the url while executing parallel tests ( use the -o option in parallel gem to give cucumber command line options):
 
 `parallel_cucumber features/ -n 4 -o "-p parallel ADMIN_BASE_URL=‘https://check-development.herokuapp.com’"`
 
If you want to run a set of tests in parallel tagged with a tag for example @smoke:
 
 `parallel_cucumber features/ -n 2 -o "-p parallel_chrome -t @smoke"`
 
#####Rerun failing scenarios

To run the tests with re run turned on use the following:

`rake features`

Options available:

`rake features OPTS='features/prototype.feature' DRIVER=XXXX`

Note: if no `DRIVER` is passed in, the default driver will be used


##Test helpers
###These helpers require ohmyzsh (https://github.com/ohmyzsh/ohmyzsh)
####Generate a new UPN 

In your `.zshrc` add the following alias with your own path to the admin-hpa folder:

`alias upn='ruby -r "/Users/X/Documents/Projects/MTC/test/admin-hpa/./features/support/upn_generator.rb" -e "UpnGenerator.generate"'` 

Close your terminal and re-open

You should be able to run the command `upn` and generate a new UPN


####Decompress archive string taken from the `recievedCheck` table

In your `.zshrc` add the following alias with your own path to the admin-hpa folder:

`alias decompress='ruby -r "/Users/X/Documents/Projects/MTC/test/admin-hpa/./features/support/received_check_decompressor.rb" -e "ReceivedCheckDecompressor.decompress_archive_message"'` 

Close your terminal and re-open

Now you can run:

`decompress <school_uuid> <check_code>`

This will then create a file in your home directory in the format:

`received_check_message_<check_code>.json`

#####Please note you will need to add your `AZURE_STORAGE_CONNECTION_STRING` to your `/admin/.env` or set `AZURE_STORAGE_CONNECTION_STRING` as an environment variable
