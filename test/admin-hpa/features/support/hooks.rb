Before do
  page.current_window.resize_to(1270, 768)
end

Before("@add_a_pupil") do
  step "I am logged in"
  @name = (0...8).map {(65 + rand(26)).chr}.join
  step "I am on the add pupil page"
  step "I submit the form with the name fields set as #{@name}"
  step "the pupil details should be stored"
  visit ENV['BASE_URL'] + '/sign-out'
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

After("@pupil_not_taking_check") do
  step "I have signed in with teacher3"
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


After("@delete_census") do
  step "I am logged in with a service manager"
  upload_pupil_census_page.load
  step 'I decide to remove the file' if upload_pupil_census_page.uploaded_file.has_remove?
end

Before("@remove_all_groups") do
  SqlDbHelper.delete_all_from_pupil_group
  SqlDbHelper.delete_all_from_group
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
  step 'I have signed in with teacher1'
  school_landing_page.access_arrangements.click
  access_arrangements_page.remove_all_pupils
end

After do |scenario|
  if scenario.failed?
    time = Time.now.strftime("%H_%M_%S")
    embed("data:image/png;base64,#{Capybara.current_session.driver.browser.screenshot_as(:base64)}", 'image/png', 'Failure')
    name = "#{scenario.name.downcase.gsub(' ', '_')}_#{time}.png"
    page.save_screenshot("screenshots/#{name}")
    p "Screenshot raised - " + "screenshots/#{name}"
    content = File.open("screenshots/#{name}", 'rb') { |file| file.read }
    AZURE_BLOB_CLIENT.create_block_blob(BLOB_CONTAINER, name, content)
    p "Screenshot uploaded to #{ENV["AZURE_ACCOUNT_NAME"]} - #{name}"
  end
  visit ENV['ADMIN_BASE_URL'] + '/sign-out'
end