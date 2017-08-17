Installing and Running MTC API tests
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
 
Use ruby version 2.4.0 and set it as your default:
 `rvm use 2.4.0 --default`

##Installing required gems

Go to the root of the /api_tests folder and run the following commands:

`gem install bundler` and then `bundle install`

These two commands will install all the gems that the tests need.

## Running the tests

#####Basic

To run the tests with the default options (running on localhost:3001 ) give the command below:

`rspec`
 
 The above command runs the all the tests in the /spec directory sequentially against 'http://localhost:3001'

If you want to run the tests on a different url:

`BASE_URL='http://anywhere_else:4200' rspec`

If you want to run a particular test, then for example run:

`rspec spec/question_spec.rb:19`

