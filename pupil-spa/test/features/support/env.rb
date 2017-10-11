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
require 'show_me_the_cookies'
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
      chromeOptions: { args: %w(headless disable-gpu) }
  )

  Capybara::Selenium::Driver.new app,
                                 browser: :chrome,
                                 desired_capabilities: capabilities
end

Dir.mkdir("reports") unless File.directory?("reports")
Capybara.javascript_driver = ENV["DRIVER"].to_sym

Mongo::Logger.logger.level = ::Logger::FATAL
ShowMeTheCookies.register_adapter(ENV['DRIVER'].to_sym, ShowMeTheCookies::Selenium) unless ENV['DRIVER'] == 'poltergeist'
ShowMeTheCookies.register_adapter('poltergeist', ShowMeTheCookies::Selenium) if ENV['DRIVER'] == 'poltergeist'

if ENV['MONGO_CONNECTION_STRING']
  CLIENT = Mongo::Client.new(ENV['MONGO_CONNECTION_STRING'])
else
  CLIENT = Mongo::Client.new('mongodb://localhost/mtc')
end

Capybara.visit Capybara.app_host
AUTH='5'

World(ShowMeTheCookies)
