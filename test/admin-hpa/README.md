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

Once rvm is installed, we need ruby version 3.2.2, to install use the following:
 `rvm install 3.2.2`

*NOTE:* If you are using Apple Silicon and the install fails, this is typically due to it using
the newer version of openssl which is not yet supported in Ruby 3.  You must direct rvm to target
the older version...

`rvm install ruby-3.2.2 --with-openssl-dir=/opt/homebrew/opt/openssl@1.1/`

Use ruby version 3.2.2 and set it as your default:
 `rvm use 3.2.2 --default`

## Install FreeTDS dependency

run `brew install FreeTDS`

## Install prerequisites

Set up the solution as per the [root readme](../../README.md)

## Install required gems

Go to the folder /test/admin-hpa and run the following commands:

`gem install bundler` and then `bundle install`

These two commands will install all the gems that the tests need.

## Start the apps

run `./setup.sh` to build all the apps
run `./restart.sh` to create and start the docker instances for SQL and Redis
start each web app (admin, spa & pupil SPA)
start each function app (func-consumption, func-throttled & func-ps-report)

## Running the tests

##### Basic

To run the tests with the default options ( headless and app running on localhost:3001 ) give the command below:

`cucumber`

 The above command runs the tests headless & sequentially in one process on url 'http://localhost:3001'

If you want to run the tests in chrome:

`cucumber DRIVER=chrome`

If you want to run a particular test, then tag the scenario with a tag like @test and run:

`cucumber -t @test`

If you want to run the tests on a different url:

`cucumber ADMIN_BASE_URL='https://check-development.herokuapp.com'`

##### Rerun failing scenarios

To run the tests with re run turned on use the following:

`rake features`

Options available:

`rake features OPTS='features/prototype.feature' DRIVER=XXXX`

Note: if no `DRIVER` is passed in, the default driver will be used


## Test helpers
### These helpers require ohmyzsh (https://github.com/ohmyzsh/ohmyzsh)
#### Generate a new UPN

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
