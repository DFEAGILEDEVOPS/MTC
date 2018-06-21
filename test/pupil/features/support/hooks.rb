Before do
  page.current_window.resize_to(1270,768)
end

Before do
  today_date = Date.today
  check_end_date = today_date + 35
  SqlDbHelper.activate_or_deactivate_active_check_window(check_end_date)
end

Before("not @event_auditing", "not @feedback", "not @local_storage") do
  step 'I am on the sign in page'
  begin
    JSON.parse(page.evaluate_script('window.localStorage.clear();'))
  rescue TypeError
  end
end

Before('@4_digit') do
  skip_this_scenario if AUTH == '5'
end

Before('@5_digit') do
  skip_this_scenario unless AUTH == '5'
end

Before('@non_browserstack_compliant') do
  skip_this_scenario if Capybara.current_driver.to_s.include? 'bs'
end

After('@window_date_time_reset') do
SqlDbHelper.update_check_window(@original['id'], 'checkEndDate', @original_end_date)
SqlDbHelper.update_check_window(@original['id'], 'checkStartDate', @original_start_date)
end

After do |scenario|
  if scenario.failed?
    time = Time.now.strftime("%H_%M_%S")
    embed("data:image/png;base64,#{Capybara.current_session.driver.browser.screenshot_as(:base64)}", 'image/png', 'Failure')
    page.save_screenshot("screenshots/#{scenario.name.downcase.gsub(' ', '_')}_#{time}.png")
    p "Screenshot raised - " + "screenshots/#{scenario.name.downcase.gsub(' ', '_')}_#{time}.png"
  end
end
