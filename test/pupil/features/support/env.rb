require 'active_support'
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
require 'show_me_the_cookies'
require_relative '../../features/support/browserstack_driver_helper'

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
  args = ["--window-size=1280,1696", "--disable-infobars", "--disable-notifications", "--no-sandbox", "--headless", "--disable-gpu"]
  Capybara::Selenium::Driver.new(app, {:browser => :chrome, :args => args})
end

Dir.mkdir("reports") unless File.directory?("reports")
Capybara.javascript_driver = ENV["DRIVER"].to_sym

Mongo::Logger.logger.level = ::Logger::FATAL
ShowMeTheCookies.register_adapter(ENV['DRIVER'].to_sym, ShowMeTheCookies::Selenium) unless ENV['DRIVER'] == 'poltergeist'
ShowMeTheCookies.register_adapter('poltergeist', ShowMeTheCookies::Selenium) if ENV['DRIVER'] == 'poltergeist'

database = ENV['SQL_DATABASE'] || 'mtc'
server = ENV['SQL_SERVER'] || 'localhost'
port =  ENV['SQL_PORT'] || 1433
admin_user = ENV['SQL_ADMIN_USER'] || 'sa'
admin_password = ENV['SQL_ADMIN_USER_PASSWORD'] || 'Mtc-D3v.5ql_S3rv3r'


SQL_CLIENT = TinyTds::Client.new(username: admin_user,
                                 password: admin_password,
                                 host: server,
                                 port: port,
                                 database: database)
SQL_CLIENT.execute('SET ANSI_NULLS ON').do
SQL_CLIENT.execute('SET CURSOR_CLOSE_ON_COMMIT OFF').do
SQL_CLIENT.execute('SET ANSI_NULL_DFLT_ON ON').do
SQL_CLIENT.execute('SET IMPLICIT_TRANSACTIONS OFF').do
SQL_CLIENT.execute('SET ANSI_PADDING ON').do
SQL_CLIENT.execute('SET QUOTED_IDENTIFIER ON').do
SQL_CLIENT.execute('SET ANSI_WARNINGS ON').do
SQL_CLIENT.execute('SET CONCAT_NULL_YIELDS_NULL ON').do

Capybara.visit Capybara.app_host
AUTH='5'

World(ShowMeTheCookies)
