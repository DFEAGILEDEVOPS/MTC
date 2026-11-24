# Chrome 158+ rejects Storage.clearDataForOrigin with origin '*'
# ("* is not a valid URL"), which breaks Capybara's reset! after every scenario.
# On Chrome <= 157 that call was a silent no-op, so skipping it keeps behaviour identical.
require 'capybara/selenium/driver'

module Chrome158ResetFix
  def execute_cdp(cmd, params = {})
    return {} if cmd == 'Storage.clearDataForOrigin' && params[:origin] == '*'

    super
  end
end

Capybara::Selenium::Driver::ChromeDriver.prepend(Chrome158ResetFix)
