require 'yaml'
require 'selenium/webdriver'
require 'capybara/cucumber'
require 'browserstack/local'
require_relative 'browserstack_settings'

BrowserstackSettings.browser_caps.keys.each do |browser|
  Capybara.register_driver "bs_#{browser}".to_sym do |app|
    @caps = BrowserstackSettings.common_caps.merge(BrowserstackSettings.browser_caps.send(browser))
    @caps = @caps.merge ({"name" => "#{Time.now.strftime("%d/%m/%y-%H:%M")}"})
    if @caps['browserstack.local'] && @caps['browserstack.local'].to_s == 'true'
      @bs_local = BrowserStack::Local.new
      bs_local_args = {"key" => "#{"#{ENV['BROWSERSTACK_ACCESS_KEY']}"}", "force" => 'true', 'localidentifier'=> ENV['BS_ID']}
      p bs_local_args
      @bs_local.start(bs_local_args)
    end
    url = "http://#{ENV['BROWSERSTACK_USERNAME']}:#{ENV['BROWSERSTACK_ACCESS_KEY']}@#{BrowserstackSettings.server}/wd/hub"
    Capybara::Selenium::Driver.new(app, browser: :remote,
                                   url: url,
                                   desired_capabilities: @caps)
  end
end

