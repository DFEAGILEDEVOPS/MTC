Before do
  @urn = SqlDbHelper.get_schools_list.map {|school| school['urn']}.sort.last + 1
  dfe_number = create_dfe_number
  @school_name = "Test School - #{@urn}"
  @school = FunctionsHelper.create_school(dfe_number[:lea_code],dfe_number[:estab_code], @school_name, @urn)
  if @school['result'] == 'Failed'
    fail "#{@school['message']}"
  end
  school_uuid = @school['entity']['urlSlug']
  @username = "teacher#{@urn}"
  @school_user = FunctionsHelper.create_user(school_uuid, @username)
  @school_id = @school_user['entity']['school_id']
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

Before('@generate_live_pin') do
  step 'I have generated a live pin'
end

Before("not @event_auditing", "not @feedback", "not @local_storage") do
  step 'I am on the sign in page'
  begin
    JSON.parse(page.evaluate_script('window.localStorage.clear();'))
  rescue TypeError
  end
end

Before('@empty_new_school') do
  @urn = SqlDbHelper.get_schools_list.map {|school| school['urn']}.sort.last + 1
  dfe_number = create_dfe_number
  @school_name = "Test School - #{@urn}"
  @school = FunctionsHelper.create_school(dfe_number[:lea_code],dfe_number[:estab_code], @school_name, @urn)
  if @school['result'] == 'Failed'
    fail "#{@school['message']}"
  end
  school_uuid = @school['entity']['urlSlug']
  @username = "teacher#{@urn}"
  @school_user = FunctionsHelper.create_user(school_uuid, @username)
  @school_id = @school_user['entity']['school_id']
  FunctionsHelper.generate_school_pin(@school_id)
  p "Login for #{@school_name} created as - #{@username}"
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

Before('@admin_logout') do
  visit ENV['ADMIN_BASE_URL']
  page.click_link('Sign out') if page.has_link?('Sign out')
end

After('@window_date_time_reset') do
  SqlDbHelper.update_check_window(@original['id'], 'checkEndDate', @original_end_date)
  SqlDbHelper.update_check_window(@original['id'], 'checkStartDate', @original_start_date)
end

After('@check_started') do
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
    fail 'this needs a test util'
    AZURE_BLOB_CLIENT.create_block_blob(BLOB_CONTAINER, name, content)
    p "Screenshot uploaded to #{ENV["AZURE_ACCOUNT_NAME"]} - #{name}"
  end
end

