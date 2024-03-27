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

Use ruby version 2.7.6 and set it as your default:
 `rvm use 3.2.2 --default`

##Installing required gems

Go to the folder /test/pupil-hpa and run the following commands:

`gem install bundler` and then `bundle install`

These two commands will install all the gems that the tests need.

## Running the tests

To run in BrowserStack mode, please enter you username and password to the root .env file in the following format:

```
BROWSERSTACK_ACCESS_KEY=XYZ
BROWSERSTACK_USERNAME=xyz
```

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

`cucumber PUPIL_BASE_URL='http://localhost:4200'`

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

`rake parallel OPTS='PUPIL_BASE_URL=http://localhost:3002 -t @tag' NODES=4 GROUP_SIZE=6`


##Using Ruby with Azure Storage

Create a file named `.env` in the root of the project and put
in your `AZURE_STORAGE_CONNECTION_STRING` in to it.

If you want to set environment variables to run the tests without the `.env` file please set the following vars:
`ENV["AZURE_ACCOUNT_NAME"]` and `ENV["AZURE_ACCOUNT_KEY"]`

#####Using Ruby with Azure Storage Queues

In the `test/pupil/features/support/azure_queue_helper.rb` we have a method
to retrieve a number of messages from a given queue. Each message has a property called `message_text`
which is Base64 encoded. Use the `decode_message_text` method to decode the message once the message
required has been found.

More methods and information can be found here:
https://github.com/azure/azure-storage-ruby/tree/master/queue

#####Using Ruby with Azure Storage Blob containers

In `test/pupil/features/support/azure_blob_helper.rb` we have the `get_blobs` method which takes a argument
for the container name. This will return a list of blobs in the container.

More methods and information can be found here:
https://github.com/azure/azure-storage-ruby/tree/master/blob

#####Using Ruby with Azure Storage Tables

In the `test/pupil/features/support/azure_table_helper.rb` we have a method to retrieve a row from a given
table using the `PartitionKey` and `RowKey`.

More methods and information can be found here:
https://github.com/azure/azure-storage-ruby/tree/master/table
