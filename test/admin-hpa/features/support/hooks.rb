Before do
  page.current_window.resize_to(1270, 768)
end

Before("@add_a_pupil") do
  step "I am logged in"
  @name = (0...8).map {(65 + rand(26)).chr}.join
  step "I am on the add pupil page"
  step "I submit the form with the name fields set as #{@name}"
  step "the pupil details should be stored"
end

Before("@timer_reset") do
  step "I am logged in with a service manager"
  step 'I am on the admin page'
  step 'I am on the check settings page'
  check_settings_page.update_question_time_limit(6)
  check_settings_page.update_loading_time_limit(3)
end

Before("@add_5_pupils") do
  step "I am logged in"
  5.times do
    @name = (0...8).map {(65 + rand(26)).chr}.join
    step "I am on the add pupil page"
    step "I submit the form with the name fields set as #{@name}"
    step "the pupil details should be stored"
  end
end

Before("@poltergeist") do
  Capybara.current_driver = :poltergeist
end

Before("@pupil_not_taking_check") do
  step "I am logged in"
  pupils_not_taking_check_page.load
  expect(pupils_not_taking_check_page).to be_displayed
  rows = all('a', text: 'Remove').count
  rows.to_i.times do |row|
    all('a', text: 'Remove').first.click
    pupils_not_taking_check_page.load
  end if pupils_not_taking_check_page.has_pupil_list?
  pupils_not_taking_check_page.sign_out.click
  visit current_url
end

After("@pupil_not_taking_check") do
  step "I am logged in"
  pupils_not_taking_check_page.load
  expect(pupils_not_taking_check_page).to be_displayed
  rows = all('a', text: 'Remove').count
  rows.to_i.times do |row|
    all('a', text: 'Remove').first.click
    pupils_not_taking_check_page.load
  end if pupils_not_taking_check_page.has_pupil_list?
  pupils_not_taking_check_page.sign_out.click
  visit current_url
end

Before("@create_new_window") do
  step "I have created a check window"
  visit Capybara.app_host + '/sign-out'
end

Before(" not @poltergeist") do
  Capybara.current_driver = ENV['DRIVER']
end

Before("@reset_all_pins") do
  SqlDbHelper.reset_all_pins
  SqlDbHelper.reset_all_pin_expiry_times
end

Before("@reset_pin_restart_check") do
  SqlDbHelper.reset_all_pins
  SqlDbHelper.reset_all_pin_expiry_times
  SqlDbHelper.delete_all_checks
  SqlDbHelper.delete_all_restarts
end

Before("@reset_checks") do
  SqlDbHelper.delete_all_checks
end

Before("@reset_pin_restart_check") do
  SqlDbHelper.reset_all_pins
  SqlDbHelper.reset_all_pin_expiry_times
  SqlDbHelper.delete_all_checks
  SqlDbHelper.delete_all_restarts
end

Before("@reset_checks") do
  SqlDbHelper.delete_all_checks
end

After("@delete_census") do
  step "I am logged in with a service manager"
  upload_pupil_census_page.load
  step 'I decide to remove the file' if upload_pupil_census_page.uploaded_file.has_remove?
end

Before("@remove_all_groups") do
  step 'I am on the groups page'
  group_pupils_page.remove_all_groups
  visit Capybara.app_host + '/sign-out'
end

Before("@no_active_check_window ") do
  today_date = Date.today
  check_end_date = today_date - 35
  SqlDbHelper.activate_or_deactivate_active_check_window(check_end_date)
end

After("@no_active_check_window ") do
  today_date = Date.today
  check_end_date = today_date + 35
  SqlDbHelper.activate_or_deactivate_active_check_window(check_end_date)
end

After("@multiple_pupil_upload") do
  FileUtils.rm(File.expand_path("#{File.dirname(__FILE__)}/../../data/multiple_pupils_template.csv"))
end

After("@remove_access_arrangements") do
  step 'I have signed in with teacher2'
  school_landing_page.access_arrangements.click
  access_arrangements_page.remove_all_pupils
end

After do |scenario|
  if scenario.failed?
    time = Time.now.strftime("%H_%M_%S")
    embed("data:image/png;base64,#{Capybara.current_session.driver.browser.screenshot_as(:base64)}", 'image/png', 'Failure')
    page.save_screenshot("screenshots/#{scenario.name.downcase.gsub(' ', '_')}_#{time}.png")
    p "Screenshot raised - " + "screenshots/#{scenario.name.downcase.gsub(' ', '_')}_#{time}.png"
  end
  visit ENV['BASE_URL'] + '/sign-out'
end