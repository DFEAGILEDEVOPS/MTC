Before do
  page.current_window.resize_to(1270, 768)
  Capybara.visit Capybara.app_host
  p Time.now
end

Before("@add_a_pupil") do
  step "I am logged in"
  @name = (0...8).map {(65 + rand(26)).chr}.join
  step "I am on the add pupil page"
  step "I submit the form with the name fields set as #{@name}"
  step "the pupil details should be stored"
  visit ENV['ADMIN_BASE_URL'] + '/sign-out'
  visit ENV['ADMIN_BASE_URL']
end

Before("@timer_reset") do
  step "I am logged in with a service manager"
  step 'I am on the admin page'
  step 'I am on the check settings page'
  check_settings_page.update_question_time_limit(6)
  check_settings_page.update_loading_time_limit(3)
  check_settings_page.update_check_time_limit(30)
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
  SqlDbHelper.delete_pupils_not_taking_check
  SqlDbHelper.set_pupil_status(6,1)
end

Before('@reset_hdf_submission') do
  school_id = SqlDbHelper.find_teacher('teacher4')['school_id']
  SqlDbHelper.delete_from_hdf(school_id)
end

After('@reset_hdf_submission') do
  school_id = SqlDbHelper.find_teacher('teacher4')['school_id']
  SqlDbHelper.delete_from_hdf(school_id)
end

Before("@hdf") do
  SqlDbHelper.delete_pupils_not_taking_check
  SqlDbHelper.set_pupil_status(6, 1)

  step 'I have signed in with teacher4'
  pupils_not_taking_check_page.load
  step 'I want to add a reason'
  @page = pupil_reason_page
  step "I select a reason"
  step "I select all pupil for pupil not taking check"
  pupil_reason_page.sticky_banner.confirm.click
  school_id = SqlDbHelper.find_teacher('teacher4')['school_id']
  begin
    retries ||= 0
    pupil_detail = SqlDbHelper.get_pupil_with_no_attandance_code(school_id)
    fail if !(pupil_detail.nil?)
  rescue
    sleep(1)
    retry if (retries += 1) < 5
  end
  Timeout.timeout(ENV['WAIT_TIME'].to_i, Timeout::Error, "There are still pupil with Not started status") {sleep 1 until SqlDbHelper.get_pupil_with_no_attandance_code(school_id).nil?}
  visit ENV['ADMIN_BASE_URL'] + '/sign-out'
end

After("@hdf") do
  SqlDbHelper.delete_pupils_not_taking_check
  SqlDbHelper.set_pupil_status(6, 1)
end

Before("@create_new_window") do
  step "I have created a check window"
  visit ENV['ADMIN_BASE_URL'] + '/sign-out'
end

Before("@create_new_window_v2") do
  step "I navigate to the create check window page"
  step "I submit details of a valid check window"
  step "I should see it added to the list of check windows"
  step "stored correctly in the db"
  visit ENV['ADMIN_BASE_URL'] + '/sign-out'
  visit ENV['ADMIN_BASE_URL']
end

Before(" not @poltergeist") do
  Capybara.current_driver = ENV['DRIVER']
end

Before("@upload_new_live_form") do
  step 'I have signed in with test-developer'
  step 'I am on the Upload and View forms page v2'
  step 'I have uploaded a valid live form'
  step 'it should be tagged as a live form'
  visit ENV['ADMIN_BASE_URL'] + '/sign-out'
end

Before("@upload_new_fam_form") do
  SqlDbHelper.delete_assigned_forms
  step 'I have signed in with test-developer'
  step 'I am on the Upload and View forms page v2'
  step 'I have uploaded a valid familiarisation form'
  step 'it should be tagged as a familiarisation form'
  visit ENV['ADMIN_BASE_URL'] + '/sign-out'
end

Before("@remove_all_groups") do
  SqlDbHelper.remove_all_pupil_from_group
  SqlDbHelper.delete_all_from_group
end

Before("@no_active_check_window") do
  today_date = Date.today
  check_end_date = today_date - 35
  SqlDbHelper.activate_or_deactivate_active_check_window(check_end_date)
end

Before("@deactivate_all_test_check_window") do
  SqlDbHelper.deactivate_all_test_check_window()
  REDIS_CLIENT.keys.each do |key|
    if key.include?('checkWindow.sqlFindActiveCheckWindow')
      REDIS_CLIENT. del key
    end
  end
end

Before("@remove_assigned_form") do
  SqlDbHelper.delete_assigned_forms
end


After('@remove_mod_school') do
  step "I am logged in with a service manager"
  step 'I navigate to the settings for MOD schools page'
  mod_schools_page.remove_school(@school)
end

After('@incomplete_pupil') do
  p @stored_pupil_details['id']
  SqlDbHelper.set_pupil_status_via_id(2, @stored_pupil_details['id'])
  SqlDbHelper.set_check_status(1,@check_id)
end

After("@no_active_check_window") do
  today_date = Date.today
  check_end_date = today_date + 35
  SqlDbHelper.activate_or_deactivate_active_check_window(check_end_date)
end

After("@multiple_pupil_upload") do
  File.delete(File.expand_path("#{File.dirname(__FILE__)}/../../data/multiple_pupils_template.csv")) if File.exist? (File.expand_path("#{File.dirname(__FILE__)}/../../data/multiple_pupils_template.csv"))
end

After("@remove_access_arrangements") do
  step 'I have signed in with teacher1'
  school_landing_page.access_arrangements.click
  access_arrangements_page.remove_all_pupils
end

After("@remove_uploaded_forms or @upload_new_live_form or @upload_new_fam_form") do
  SqlDbHelper.delete_assigned_forms
  SqlDbHelper.delete_forms
  SqlDbHelper.assign_fam_form_to_window if SqlDbHelper.get_default_assigned_fam_form == nil
end

Before("@redis") do
  REDIS_CLIENT.keys.each do |key|
    if key.include?('checkWindow.sqlFindActiveCheckWindow')
      REDIS_CLIENT. del key
    end
  end
end

After("@redis") do
  REDIS_CLIENT.keys.each do |key|
    if key.include?('checkWindow.sqlFindActiveCheckWindow')
      REDIS_CLIENT. del key
    end
  end
end

After("@result") do
  today_date = Date.today
  check_end_date = today_date + 35
  SqlDbHelper.update_check_end_date(check_end_date)
end


After do |scenario|
  if scenario.failed?
    time = Time.now.strftime("%H_%M_%S")
    width = page.execute_script("return Math.max(document.body.scrollWidth, document.body.offsetWidth, document.documentElement.clientWidth, document.documentElement.scrollWidth, document.documentElement.offsetWidth);")
    height = page.execute_script("return Math.max(document.body.scrollHeight, document.body.offsetHeight, document.documentElement.clientHeight, document.documentElement.scrollHeight, document.documentElement.offsetHeight);")
    page.current_window.resize_to(width, height)
    embed("data:image/png;base64,#{Capybara.current_session.driver.browser.screenshot_as(:base64)}", 'image/png', 'Failure')
    name = "#{scenario.name.downcase.gsub(' ', '_')}_#{time}.png"
    page.save_screenshot("screenshots/#{name}")
    p "Screenshot raised - " + "screenshots/#{name}"
    content = File.open("screenshots/#{name}", 'rb') {|file| file.read}
    AZURE_BLOB_CLIENT.create_block_blob(BLOB_CONTAINER, name, content)
    p "Screenshot uploaded to #{ENV["AZURE_ACCOUNT_NAME"]} - #{name}"
  end
  SqlDbHelper.add_fam_form
  SqlDbHelper.assign_fam_form_to_window if SqlDbHelper.get_default_assigned_fam_form == nil
  visit ENV['ADMIN_BASE_URL'] + '/sign-out'
  visit ENV['ADMIN_BASE_URL']
  p Time.now
end

at_exit do
  SqlDbHelper.update_to_10_questions
end

