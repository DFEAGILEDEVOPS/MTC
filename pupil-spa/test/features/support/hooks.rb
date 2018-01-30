Before do
  page.current_window.resize_to(1270,768)
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
  original = SqlDbHelper.get_check_window_via_name('Development Phase')
  check_end_date = (Time.now + 3*24*60*60).strftime("%Y-%m-%d %H:%M:%S.%LZ")
  check_start_date = (Time.now).strftime("%Y-%m-%d %H:%M:%S.%LZ")
  SqlDbHelper.update_check_window(original['id'], 'checkEndDate', check_end_date)
  SqlDbHelper.update_check_window(original['id'], 'checkStartDate', check_start_date)
end

After do |scenario|
  if scenario.failed?
    time = Time.now.strftime("%H_%M_%S")
    page.save_screenshot("screenshots/#{scenario.name.downcase.gsub(' ', '_')}_#{time}.png")
    p "Screenshot raised - " + "screenshots/#{scenario.name.downcase.gsub(' ', '_')}_#{time}.png"
  end
end
