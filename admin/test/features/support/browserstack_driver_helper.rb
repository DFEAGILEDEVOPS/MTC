require 'yaml'
require 'selenium/webdriver'
require 'capybara/cucumber'
require 'browserstack/local'
require_relative 'browserstack_settings'

BrowserstackSettings.browser_caps.keys.each do |browser|
  Capybara.register_driver "bs_#{browser}".to_sym do |app|
    @caps = BrowserstackSettings.common_caps.merge(BrowserstackSettings.browser_caps.send(browser))
    if @caps['browserstack.local'] && @caps['browserstack.local'].to_s == 'true'
      @bs_local = BrowserStack::Local.new
      bs_local_args = {"key" => "#{"#{ENV['BS_KEY']}"}", "force" => 'true'}
      @bs_local.start(bs_local_args)
    end
    url = "http://#{ENV['BS_USER']}:#{ENV['BS_KEY']}@#{BrowserstackSettings.server}/wd/hub"
    Capybara::Selenium::Driver.new(app, browser: :remote,
                                   url: url,
                                   desired_capabilities: @caps)
  end
end

