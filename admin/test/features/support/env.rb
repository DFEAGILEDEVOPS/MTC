require 'rubygems'
require 'active_support'
require 'capybara'
require 'capybara/cucumber'
require 'require_all'
require 'rspec'
require 'selenium-webdriver'
require 'site_prism'
require 'pry'
require 'capybara/poltergeist'
require 'mongo'
require 'csv'
require 'fileutils'
require 'date'
require 'waitutil'
require 'tiny_tds'
require_relative '../../../test/features/support/browserstack_driver_helper'
require_relative 'helpers'
include Helpers

raise 'Please pass a BASE_URL with the cucumber command.' unless ENV['BASE_URL']

Capybara.configure do |config|
  config.default_driver = ENV["DRIVER"].to_sym
  config.app_host = ENV["BASE_URL"]
  config.exact_options = true
  config.ignore_hidden_elements = false
  config.visible_text_only = true
end

Capybara.register_driver(:chrome) do |app|
  Capybara::Selenium::Driver.new(app, browser: :chrome)
end

Capybara.register_driver :poltergeist do |app|
  Capybara::Poltergeist::Driver.new(app, js_errors: false, timeout: 60)
end

Capybara.register_driver :headless_chrome do |app|
  capabilities = Selenium::WebDriver::Remote::Capabilities.chrome(
  chromeOptions: { args: %w(headless)}
  )

  Capybara::Selenium::Driver.new app,
  browser: :chrome,
  desired_capabilities: capabilities
end

Dir.mkdir("reports") unless File.directory?("reports")
Capybara.javascript_driver = ENV["DRIVER"].to_sym

Mongo::Logger.logger.level = ::Logger::FATAL

if ENV['MONGO_CONNECTION_STRING']
  CLIENT = Mongo::Client.new(ENV['MONGO_CONNECTION_STRING'])
else
  CLIENT = Mongo::Client.new('mongodb://localhost/mtc')
end

Database = ENV['SQL_DATABASE'] || 'mtc'
Server = ENV['SQL_SERVER'] || 'localhost'
Port =  ENV['SQL_PORT'] || 1433
Admin_User = ENV['SQL_ADMIN_USER'] || 'sa'
Admin_Password = ENV['SQL_ADMIN_USER_PASSWORD'] || 'Mtc-D3v.5ql_S3rv3r'


SQL_CLIENT = TinyTds::Client.new(username: Admin_User,
                                 password: Admin_Password,
                                 host: Server,
                                 port: Port,
                                 database: Database)
SQL_CLIENT.execute('SET ANSI_NULLS ON').do
SQL_CLIENT.execute('SET CURSOR_CLOSE_ON_COMMIT OFF').do
SQL_CLIENT.execute('SET ANSI_NULL_DFLT_ON ON').do
SQL_CLIENT.execute('SET IMPLICIT_TRANSACTIONS OFF').do
SQL_CLIENT.execute('SET ANSI_PADDING ON').do
SQL_CLIENT.execute('SET QUOTED_IDENTIFIER ON').do
SQL_CLIENT.execute('SET ANSI_WARNINGS ON').do
SQL_CLIENT.execute('SET CONCAT_NULL_YIELDS_NULL ON').do


Capybara.visit Capybara.app_host
