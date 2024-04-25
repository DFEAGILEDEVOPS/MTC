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
  step 'I login to the admin app'
  visit ENV['ADMIN_BASE_URL'] + add_multiple_pupil_page.url
  @upns_for_school = add_multiple_pupil_page.upload_pupils(5, @school_name)
  visit ENV['ADMIN_BASE_URL'] + '/sign-out'
  page.current_window.resize_to(1270, 768)
  p "MTC0100 = #{JSON.parse(SqlDbHelper.get_form(1)['formData']).size} questions"
  p "MTC0103 = #{JSON.parse(SqlDbHelper.get_form(4)['formData']).size} questions"
end

Before('@generate_live_pin_hook') do
Before('@generate_live_pin_hook') do
  step 'I have generated a live pin'
end

Before("not @event_auditing", "not @feedback_hook", "not @local_storage_hook") do
Before("not @event_auditing", "not @feedback_hook", "not @local_storage_hook") do
  step 'I am on the sign in page'
  begin
    JSON.parse(page.evaluate_script('window.localStorage.clear();'))
  rescue TypeError
  end
end

Before('@ps_report_hook') do
  # File.truncate(File.expand_path("#{File.dirname(__FILE__)}/../../data/ps_report_data_set_1.csv"), 0) if File.exist?(File.expand_path("#{File.dirname(__FILE__)}/../../data/ps_report_data_set_1.csv"))
  # File.truncate(File.expand_path("#{File.dirname(__FILE__)}/../../data/ps_report_data_set_2.csv"), 0) if File.exist?(File.expand_path("#{File.dirname(__FILE__)}/../../data/ps_report_data_set_2.csv"))
Before('@ps_report_hook') do
  # File.truncate(File.expand_path("#{File.dirname(__FILE__)}/../../data/ps_report_data_set_1.csv"), 0) if File.exist?(File.expand_path("#{File.dirname(__FILE__)}/../../data/ps_report_data_set_1.csv"))
  # File.truncate(File.expand_path("#{File.dirname(__FILE__)}/../../data/ps_report_data_set_2.csv"), 0) if File.exist?(File.expand_path("#{File.dirname(__FILE__)}/../../data/ps_report_data_set_2.csv"))
end

Before('@admin_logout_hook') do
Before('@admin_logout_hook') do
  visit ENV['ADMIN_BASE_URL']
  page.click_link('Sign out') if page.has_link?('Sign out')
end

After('@window_date_time_reset_hook') do
After('@window_date_time_reset_hook') do
  SqlDbHelper.update_check_window(@original['id'], 'checkEndDate', @original_end_date)
  SqlDbHelper.update_check_window(@original['id'], 'checkStartDate', @original_start_date)
end

After('@check_started_hook') do
After('@check_started_hook') do
  p @check_code
  (wait_until(60, 1) {SqlDbHelper.get_check(@check_code)['startedAt'].is_a?(Time)}) unless @check_code.nil?
  p (SqlDbHelper.get_check(@check_code)['startedAt']) unless @check_code.nil?
end

After do |scenario|
  if scenario.failed?
    time = Time.now.strftime("%H_%M_%S")
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
end
