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

### macOS (via [homebrew](https://brew.sh/))
`brew install FreeTDS`

### windows (WSL) or linux
`sudo apt-get -y install freetds-dev`

## Install prerequisites

### Apps & Services
Set up the solution as per the [root readme](../README.md)

## Install required gems

Go to the folder /test/admin-hpa and run the following commands:

`gem install bundler` and then `bundle install`

These two commands will install all the gems that the tests need.

## Start the apps

run `./setup.sh` to build all the apps
run `./restart.sh` to create and start the docker instances for SQL and Redis
start each web app (admin, spa & pupil SPA)
start each function app (func-consumption, func-throttled & func-ps-report)

As part of the above setup, 10k dummy schools with pupils are added.

## Running the tests

#### Folder structure

The MTC tests are split in to 2 folders, `admin-hpa` (admin app) and `pupil-hpa` (pupil-app)
In each of the above folders, the standard cucumber testing framework structure is followed

##### Basic

To run the tests with the default options ( headless and app running on localhost:3001 ) give the command below:

`cucumber`

 The above command runs the tests headless & sequentially in one process on url 'http://localhost:3001'

If you want to run the tests in chrome:

`cucumber DRIVER=chrome`

If you want to run a particular test, then tag the scenario with a tag like @test and run:

`cucumber -t @test`

You can also run a specific test by specifying the line number of the scenario like the following

`cucumber features/name_of_feature.feature:12`

If you want to run the tests on a different environment then the following env var values have to be changed in `env.rb` specific to the envinronment under test :

`ENV["ADMIN_BASE_URL"] ||= 'http://localhost:3001'`

`ENV["PUPIL_BASE_URL"] ||= 'http://localhost:4200'`

`ENV["PUPIL_API_BASE_URL"] ||= 'http://localhost:3003'`

`ENV["FUNC_THROTTLED_BASE_URL"] ||= 'http://localhost:7073/admin/functions'`

`ENV["FUNC_THROTTLED_MASTER_KEY"] ||= nil`

`ENV['FUNC_CONSUMP_BASE_URL'] ||= 'http://localhost:7071'`

`ENV["FUNC_CONSUMP_MASTER_KEY"] ||= nil`

`database = ENV['SQL_DATABASE'] || 'mtc'`

`server = ENV['SQL_SERVER'] || 'localhost'`

`port = ENV['SQL_PORT'] || 1433`

`admin_password = ENV['SQL_ADMIN_USER_PASSWORD'] || 'Mtc-D3v.5ql_S3rv3r'`

`redis_key = ENV['REDIS_KEY'] || ''`

`redis_port = ENV['REDIS_PORT'] || 6379`

##### Rerun failing scenarios

To run the tests with re run turned on use the following:

`rake features`

Options available:

`rake features OPTS='features/prototype.feature' DRIVER=XXXX`

Note: if no `DRIVER` is passed in, the default driver will be used

##### Running tests in parallel

To run the tests in parallel, install the parallel library:

`brew install parallel`

Once installed navigate to `tests/admin-hpa` or `test/pupil-hpa` and run the following:

`./run-local-tests.sh`

The script above uses cucumber tags to identifiy which scenarios are eligble to be run in parallel and which ones
need to be run serially.

These tags are then listed in `tags-serial.txt` and `tags-parallel.txt`

Scenarios that are not tagged or the tags have not been added to either the `tags-serial.txt` or `tags-parallel.txt` will not be included in either the serial or parallel test run.

## Test helpers
### These helpers require ohmyzsh (https://github.com/ohmyzsh/ohmyzsh)
#### Generate a new UPN

In your `.zshrc` add the following alias with your own path to the admin-hpa folder:

`alias upn='ruby -r "/Users/X/Documents/Projects/MTC/test/admin-hpa/./features/support/upn_generator.rb" -e "UpnGenerator.generate"'`

Close your terminal and re-open

You should be able to run the command `upn` and generate a new UPN

##Selenium Manager

Selenium manager is being used to help with the management of the chrome driver used when executing the tests.

The Chrome version is locked to the version set in `test/se_manager/.cache/selenium/se-config.toml`

Simply change the browser version in `test/se_manager/.cache/selenium/se-config.toml` to update the Chrome version.

More information about Selenium Manager can be found here -
https://www.selenium.dev/documentation/selenium_manager/
