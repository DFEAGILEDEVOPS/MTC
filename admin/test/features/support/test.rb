# require 'rubygems'
# require 'selenium-webdriver'
# require 'pry'
#
# caps = Selenium::WebDriver::Remote::Capabilities.new
# caps["browser"] = "IE"
# caps["browser_version"] = "7.0"
# caps["os"] = "Windows"
# caps["os_version"] = "XP"
# caps["browserstack.debug"] = "true"
# caps["name"] = "Testing Selenium 2 with Ruby on BrowserStack"
# driver = Selenium::WebDriver.for(:remote,
#                                  :url => "http://mohsen20:ZyZxbzNCWSdnp1sgLCEz@hub-cloud.browserstack.com/wd/hub",
#                                  :desired_capabilities => caps)
# binding.pry
# driver.file_detector = lambda do |args|
#   str = args.first.to_s
#   str if File.exist?(str)
# end
# driver.navigate.to "http://www.fileconvoy.com"
# driver.find_element(:id, "upfile_0").send_keys("/Users/mohsenqureshi/Documents/Projects/MTC/admin/test/data/format.txt");
# driver.find_element(:id, "readTermsOfUse").click;
# driver.find_element(:name, "form_upload").submit;
# sleep(5)
