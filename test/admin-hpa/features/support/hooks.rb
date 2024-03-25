require 'pp'

Before do
  @school = SqlDbHelper.get_random_school
  if @school.nil?
    fail "unable to obtain random school via SqlDbHelper.get_random_school"
  end

  @urn = @school['urn']
  @school_name = @school['name']
  @school_id = @school['id']
  @school_uuid = @school['urlSlug']
  @school_user = SqlDbHelper.get_school_teacher(@urn)
  @username = @school_user['identifier']


  FunctionsHelper.generate_school_pin(@school_id)
  p "Login for #{@school_name} created as - #{@username}"
  step 'I am logged in'
  step 'I am on the add multiple pupil page'
  @upns_for_school = add_multiple_pupil_page.upload_pupils(5, @school_name)
  page.current_window.resize_to(1270, 768)
  Capybara.visit Capybara.app_host
  p Time.now
  expect(sign_in_page.cookies_banner.accept_all)
  sign_in_page.cookies_banner.accept_all.click if sign_in_page.cookies_banner.accept_all.visible?
  visit ENV['ADMIN_BASE_URL'] + '/sign-out'
  Dir.glob(File.expand_path("#{File.dirname(__FILE__)}/../../data/download/*")).each {|file| File.delete file}
  p "MTC0100 = #{JSON.parse(SqlDbHelper.get_form(1)['formData']).size} questions"
  p "MTC0103 = #{JSON.parse(SqlDbHelper.get_form(4)['formData']).size} questions"
end

Before('@empty_new_school') do
  @school = SqlDbHelper.get_random_school
  if @school.nil?
    fail "unable to obtain random school via SqlDbHelper.get_random_school"
  end

  @urn = @school['urn']
  @school_name = @school['name']
  @school_id = @school['school_id']
  @school_uuid = @school['urlSlug']
  @school_user = SqlDbHelper.get_school_teacher(@urn)
  @username = @school_user['identifier']

  FunctionsHelper.generate_school_pin(@school_id)
  p "Login for #{@school_name} created as - #{@username}"
end

Before('@new_school_no_password') do
  @school = SqlDbHelper.get_random_school
  if @school.nil?
    fail "unable to obtain random school via SqlDbHelper.get_random_school"
  end

  @urn = @school['urn']
  @school_name = @school['name']
  @school_id = @school['school_id']
  @school_uuid = @school['urlSlug']
  @school_user = SqlDbHelper.get_school_teacher(@urn)
  @username = @school_user['identifier']
  p "Login for #{@school_name} created as - #{@username}"
end

Before('@service_manager_message') do
  step 'I am on the manage service message page'
  manage_service_message_page.remove_service_message if manage_service_message_page.has_remove_message?
  visit ENV['ADMIN_BASE_URL'] + '/sign-out'
  visit ENV['ADMIN_BASE_URL']
end

Before('@school_import') do
  begin
    AZURE_BLOB_CLIENT.create_container('school-import')
  rescue Azure::Core::Http::HTTPError => e
    p 'school-import container already exists' if e.status_code == 409
    p e.description unless e.status_code == 409
  end
end

After('@check_start_date_reset') do
  SqlDbHelper.update_check_window(@check_window['id'], 'checkStartDate', @original_check_start_date.strftime("%Y-%m-%d %H:%M:%S.%LZ"))
end

After('@post_check_window_settings') do
  SqlDbHelper.update_check_end_date((Date.today) + 30)
  SqlDbHelper.update_admin_end_date((Date.today) + 30)
  REDIS_CLIENT. del 'checkWindow.sqlFindActiveCheckWindow'
end

Before("@delete_school_import") do
  SqlDbHelper.delete_schools_audit_history
  SqlDbHelper.delete_schools_imported
  files = AZURE_BLOB_CLIENT.list_blobs('school-import').map {|a| a.name}
  files.each do |filename|
    AZURE_BLOB_CLIENT.delete_blob('school-import', filename)
  end
end


After("@processing_error_hdf") do
  SqlDbHelper.update_check_end_date((Date.today) + 2)
end

Before('@incomplete_pupil') do
  REDIS_CLIENT.del 'settings'
  SqlDbHelper.set_check_time_limit(1)
  step "I am logged in with a service manager"
  step "I am on the check settings page"
  visit ENV['ADMIN_BASE_URL'] + '/sign-out'
  visit ENV['ADMIN_BASE_URL']
end

After('@service_manager_message') do
  step 'I am on the manage service message page'
  manage_service_message_page.remove_service_message if manage_service_message_page.has_remove_message?
  visit ENV['ADMIN_BASE_URL'] + '/sign-out'
  visit ENV['ADMIN_BASE_URL']
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

Before("@poltergeist") do
  Capybara.current_driver = :poltergeist
end

After("@pupil_not_taking_check") do
  SqlDbHelper.delete_pupils_not_taking_check(@school_id)
end

After("@attendance_code") do
  visit ENV['ADMIN_BASE_URL'] + '/sign-out'
  step "I am logged in with a service manager"
  admin_page.manage_attendance_codes.click
  manage_attendance_codes_page.enable_all_attendance_codes
  visit ENV['ADMIN_BASE_URL'] + '/sign-out'
end

Before('@reset_hdf_submission') do
  school_id = SqlDbHelper.find_teacher(@username)['school_id']
  SqlDbHelper.delete_from_hdf(school_id)
end

After('@reset_hdf_submission') do
  school_id = SqlDbHelper.find_teacher(@username)['school_id']
  SqlDbHelper.delete_from_hdf(school_id)
end

Before("@hdf") do
  SqlDbHelper.delete_pupils_not_taking_check(@school_user['school_id'])
  SqlDbHelper.set_pupil_attendance_via_school(@school_user['school_id'], 'null')
  step "I have signed in with #{@username}"
  pupils_not_taking_check_page.load
  step 'I want to add a reason'
  @page = pupil_reason_page
  step "I select a reason"
  step "I select all pupil for pupil not taking check"
  pupil_reason_page.sticky_banner.confirm.click
  pupil_status_page.load
  @number_of_pupils = SqlDbHelper.list_of_pupils_from_school(SqlDbHelper.find_teacher(@username)['school_id']).count
  expect(pupil_status_page.pupils_completed.count.text.to_i).to eql @number_of_pupils
  visit ENV['ADMIN_BASE_URL'] + '/sign-out'
end

After("@live_tio_expired") do
  SqlDbHelper.update_check_end_date((Date.today) + 7)
  visit ENV['ADMIN_BASE_URL'] + '/sign-out'
  step "I am logged in with a service manager"
  admin_page.manage_check_windows.click
  @check_window = manage_check_window_page.find_check_row('Development Phase')
  @check_window.check_name.click
  add_edit_check_window_page.save_changes.click
end

After("@hdf") do
  SqlDbHelper.delete_pupils_not_taking_check(@school_id)
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
  SqlDbHelper.delete_all_school_groups(@urn)
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
      REDIS_CLIENT.del key
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
  REDIS_CLIENT.del 'settings'
  SqlDbHelper.set_check_time_limit(30)
  step "I am logged in with a service manager"
  step "I am on the check settings page"
  visit ENV['ADMIN_BASE_URL'] + '/sign-out'
  visit ENV['ADMIN_BASE_URL']
end

After("@no_active_check_window") do
  today_date = Date.today
  check_end_date = today_date + 35
  SqlDbHelper.activate_or_deactivate_active_check_window(check_end_date)
end

After("@multiple_pupil_upload") do
  File.delete(File.expand_path("#{File.dirname(__FILE__)}/../../data/multiple_pupils_template.csv")) if File.exist? (File.expand_path("#{File.dirname(__FILE__)}/../../data/multiple_pupils_template.csv"))
end

After("@remove_uploaded_forms or @upload_new_live_form or @upload_new_fam_form") do
  SqlDbHelper.delete_assigned_forms
  SqlDbHelper.delete_forms
  SqlDbHelper.assign_fam_form_to_window if SqlDbHelper.get_default_assigned_fam_form == nil
end

Before("@redis") do
  REDIS_CLIENT.keys.each do |key|
    if key.include?('checkWindow.sqlFindActiveCheckWindow')
      REDIS_CLIENT.del key
    end
  end
end

Before("@pupil_register_v2") do
  p 'Skipping this scenario until pupilRegisterV2 is set to true by default'
  skip_this_scenario
end

After("@redis") do
  REDIS_CLIENT.keys.each do |key|
    if key.include?('checkWindow.sqlFindActiveCheckWindow')
      REDIS_CLIENT.del key
    end
  end
end

After("@results") do
  today_date = Date.today
  check_end_date = today_date + 35
  SqlDbHelper.update_check_end_date(check_end_date)
  REDIS_CLIENT.keys.each do |key|
    if key.include?('checkWindow.sqlFindActiveCheckWindow')
      REDIS_CLIENT.del key
    end
  end
  step "I am logged in"
  visit ENV['ADMIN_BASE_URL'] + '/sign-out'
end


After do |scenario|
  if scenario.failed?
    time = Time.now.strftime("%H_%M_%S")
    sleep 5
    width = page.execute_script("return Math.max(document.body.scrollWidth, document.body.offsetWidth, document.documentElement.clientWidth, document.documentElement.scrollWidth, document.documentElement.offsetWidth);")
    height = page.execute_script("return Math.max(document.body.scrollHeight, document.body.offsetHeight, document.documentElement.clientHeight, document.documentElement.scrollHeight, document.documentElement.offsetHeight);")
    page.current_window.resize_to(width, height)
    attach(Capybara.current_session.driver.browser.screenshot_as(:png), 'image/png')
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
