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
 
Use ruby version 2.4.0 and set it as your default:
 `rvm use 2.4.0 --default`

##Installing required gems

Go to the folder /test and run the following commands:

`gem install bundler` and then `bundle install`

These two commands will install all the gems that the tests need.

## Running the tests

#####Basic

To run the tests with the default options ( headless and app running on localhost:4200 ) give the command below:

`cd test`
And then: 
`cucumber`
 
 The above command runs the tests headless & sequentially in one process on url 'http://localhost:4200'

If you want to run the tests in chrome:

`cucumber DRIVER=selenium_chrome`

If you want to run a particular test, then tag the scenario with a tag like @test and run:

`cucumber -t @test`

If you want to run the tests on a different url:

`cucumber BASE_URL='http://localhost:4200'`

#####Rerun failing scenarios

To run the tests with re run turned on use the following:

`rake features`

Options available:

`rake features OPTS='features/prototype.feature' DRIVER=XXXX`

Note: if no `DRIVER` is passed in, the default driver will be used

#####Run tests in parallel

To run the tests with re run turned on use the following:

`rake parallel`

The above actually runs the scenarios sequentially, to get
any benefit then you need to add the following:

Options available:

`rake parallel NODES=4 GROUP_SIZE=5`
 
Set the `NODES` environment variable to how many threads / nodes you want.
Set the `GROUP_SIZE` environment variable to how many scenarios you want in 
group that will be executed on one of the nodes

You can also pass in any other options by using the following:

`rake parallel OPTS='BASE_URL=http://localhost:3002 -t @tag' NODES=4 GROUP_SIZE=6`
