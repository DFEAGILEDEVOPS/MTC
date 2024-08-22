require 'active_support'
require 'active_support/all'
require 'capybara'
require 'capybara/cucumber'
require 'require_all'
require 'rspec'
require 'selenium-webdriver'
require 'site_prism'
require 'pry'
require 'capybara/poltergeist'
require 'numbers_in_words'
require 'mongo'
require 'waitutil'
require 'tiny_tds'
require 'redis'
require 'httparty'
require_relative '../../features/support/browserstack_driver_helper'
require_relative '../../features/support/request_helper'
require_relative '../../features/support/sql_db_helper'
require 'azure/storage/table'
require 'azure/storage/queue'
require 'azure/storage/blob'
require_relative '../../features/support/azure_blob_helper'
require 'redis'
require 'lz_string'
require_relative '../../features/support/app'
require 'dotenv'
require 'jwt'
require 'csv'

require_relative 'helpers'
include Helpers

Dotenv.load('../../.env')

logger = Selenium::WebDriver.logger
logger.level = :info

(abort "LIVE_FORM_QUESTION_COUNT is set to #{ENV['LIVE_FORM_QUESTION_COUNT']}. The tests require this to be set to 25. Please update this value to 25 and rebuild the apps") unless ENV['LIVE_FORM_QUESTION_COUNT'].to_i == 25

ENV['SE_CACHE_PATH'] ||=File.expand_path("#{File.dirname(__FILE__)}/../../../se_manager/.cache/selenium")
ENV["ADMIN_BASE_URL"] ||= 'http://localhost:3001'
ENV["PUPIL_BASE_URL"] ||= 'http://localhost:4200'
ENV["PUPIL_API_BASE_URL"] ||= 'http://localhost:3003'
ENV["FUNC_THROTTLED_BASE_URL"] ||= 'http://localhost:7073/admin/functions'
ENV['FUNC_PS_REPORT_BASE_URL']  ||= 'http://localhost:7074/admin/functions'
ENV['FUNC_PS_REPORT_MASTER_KEY']  ||= nil
ENV["FUNC_THROTTLED_MASTER_KEY"] ||= nil
ENV['WAIT_TIME'] ||= '300'
ENV['PS_REPORT_WAIT_TIME'] ||= '300'
ENV['FUNC_CONSUMP_BASE_URL'] ||= 'http://localhost:7071'
ENV["FUNC_CONSUMP_MASTER_KEY"] ||= nil
ENV['PS_REPORT_WAIT_TIME'] ||= '300'
ENV['CHECK_SUBMIT_JWT_SECRET'] ||= Dotenv.parse("../../.env")['CHECK_SUBMIT_JWT_SECRET']

Capybara.configure do |config|
  config.default_driver = ENV["DRIVER"].to_sym
  config.app_host = ENV["PUPIL_BASE_URL"]
  config.exact = true
  config.ignore_hidden_elements = false
  config.visible_text_only = true
  seconds = 7
  config.default_max_wait_time = seconds
end

Capybara.register_driver(:chrome) do |app|
  browser_options = Selenium::WebDriver::Options.chrome
  browser_options.page_load_strategy = :normal
  Capybara::Selenium::Driver.new(app, browser: :chrome, options: browser_options)
end

Capybara.register_driver :headless_chrome do |app|
  browser_options = Selenium::WebDriver::Options.chrome
  browser_options.page_load_strategy = :normal
  browser_options.args << '--headless=new'
  browser_options.args << '--no-sandbox'
  browser_options.args << '--disable-dev-shm-usage'
  browser_options.args << '--disable-gpu'
  browser_options.args << '--allow-insecure-localhost'
  Capybara::Selenium::Driver.new(app, browser: :chrome, options: browser_options)
end

Capybara.register_driver :no_local_storage do |app|
  browser_options = Selenium::WebDriver::Options.chrome
  browser_options.page_load_strategy = :normal
  browser_options.args << '--headless=new'
  browser_options.args << '--no-sandbox'
  browser_options.args << '--disable-local-storage'
  browser_options.args << '--disable-dev-shm-usage'
  browser_options.args << '--disable-gpu'
  browser_options.args << '--allow-insecure-localhost'
  Capybara::Selenium::Driver.new(app, browser: :chrome, options: browser_options)
end

Dir.mkdir("reports") unless File.directory?("reports")
Capybara.javascript_driver = ENV["DRIVER"].to_sym

database = ENV['SQL_DATABASE'] || 'mtc'
server = ENV['SQL_SERVER'] || 'localhost'
port =  ENV['SQL_PORT'] || 1433
admin_password = ENV['SQL_ADMIN_USER_PASSWORD'] || 'Mtc-D3v.5ql_S3rv3r'
azure_test = ENV['AZURE'] || 'false'
if azure_test == 'true'
  azure_var = true
  admin_user = ENV['SQL_ADMIN_USER'] + '@' + ENV['SQL_SERVER_SHORTNAME']
else
  azure_var = false
  admin_user = ENV['SQL_ADMIN_USER'] || 'sa'
end

SQL_CLIENT = SqlDbHelper.connect(admin_user,admin_password,server,port,database,azure_var)

SQL_CLIENT.execute('SET ANSI_NULLS ON').do
SQL_CLIENT.execute('SET CURSOR_CLOSE_ON_COMMIT OFF').do
SQL_CLIENT.execute('SET ANSI_NULL_DFLT_ON ON').do
SQL_CLIENT.execute('SET IMPLICIT_TRANSACTIONS OFF').do
SQL_CLIENT.execute('SET ANSI_PADDING ON').do
SQL_CLIENT.execute('SET QUOTED_IDENTIFIER ON').do
SQL_CLIENT.execute('SET TEXTSIZE 2147483647').do
SQL_CLIENT.execute('SET ANSI_WARNINGS ON').do
SQL_CLIENT.execute('SET CONCAT_NULL_YIELDS_NULL ON').do

if File.exist?('../../.env')
  credentials = File.read('../../.env').split('AZURE_STORAGE_CONNECTION_STRING').last.split(';')
  @account_name = credentials.find{|a| a.include? 'AccountName' }.gsub('AccountName=','')
  @account_key = credentials.find{|a| a.include? 'AccountKey' }.gsub('AccountKey=','')
else
  credentials = ENV['AZURE_STORAGE_CONNECTION_STRING'].split('AZURE_STORAGE_CONNECTION_STRING').last.split(';')
  @account_name = credentials.find{|a| a.include? 'AccountName' }.gsub('AccountName=','')
  @account_key = credentials.find{|a| a.include? 'AccountKey' }.gsub('AccountKey=','')
end

ENV["AZURE_ACCOUNT_NAME"] ||= @account_name
ENV["AZURE_ACCOUNT_KEY"] ||= @account_key

fail 'Please set the env var AZURE_STORAGE_CONNECTION_STRING' if ENV["AZURE_ACCOUNT_NAME"].nil?
fail 'Please set the env var AZURE_STORAGE_CONNECTION_STRING' if ENV["AZURE_ACCOUNT_KEY"].nil?

AZURE_TABLE_CLIENT = Azure::Storage::Table::TableService.create(storage_account_name: ENV["AZURE_ACCOUNT_NAME"], storage_access_key: ENV["AZURE_ACCOUNT_KEY"])
AZURE_QUEUE_CLIENT = Azure::Storage::Queue::QueueService.create(storage_account_name: ENV["AZURE_ACCOUNT_NAME"], storage_access_key: ENV["AZURE_ACCOUNT_KEY"])
AZURE_BLOB_CLIENT = Azure::Storage::Blob::BlobService.create(storage_account_name: ENV["AZURE_ACCOUNT_NAME"], storage_access_key: ENV["AZURE_ACCOUNT_KEY"])
BLOB_CONTAINER = AzureBlobHelper.no_fail_create_container("screenshots-#{Time.now.strftime("%d-%m-%y")}")
# AzureBlobHelper.remove_old_containers
SqlDbHelper.update_to_25_questions

redis_key = ENV['REDIS_KEY'] || ''
redis_port =  ENV['REDIS_PORT'] || 6379

if ENV['DOCKER'] == 'true'
  redis_host = 'redis'
else
  redis_host = ENV['REDIS_HOST'] || 'localhost'
end

if azure_test == 'true'
  REDIS_CLIENT = Redis.new(host: "#{redis_host}", port: redis_port, password: "#{redis_key}", :ssl => :true)
else
  REDIS_CLIENT = Redis.new(host: "#{redis_host}", port: redis_port)
end

begin
  REDIS_CLIENT.ping
rescue Redis::BaseError => e
  fail "REDIS connection issue - #{e.inspect}"
end
