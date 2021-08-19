Given(/^I am on the warm up complete page using a real pupil$/) do
  step 'I have generated a live pin'
  step 'I have logged in'
  confirmation_page.read_instructions.click
  start_page.start_warm_up.click
  warm_up_page.start_now.click
  step 'I should be able to use the numpad to complete the warm up questions'
end

Then(/^I should still have a valid pin$/) do
  visit Capybara.app_host + '/sign-out'
  sign_in_page.load
  sign_in_page.login(@pupil_credentials[:school_password], @pupil_credentials[:pin])
  sign_in_page.sign_in_button.click
  expect(confirmation_page).to be_displayed
end

Given(/^I have completed the check(?: using the (.+))?$/) do |input|
  input_type = (input ? input : 'numpad')
  step 'I have generated a live pin'
  step 'I have logged in'
  confirmation_page.read_instructions.click
  start_page.start_warm_up.click
  warm_up_page.start_now.click
  step "I complete the warm up questions using the #{input_type}"
  warm_up_complete_page.start_check.click
  mtc_check_start_page.start_now.click
  questions = JSON.parse page.evaluate_script('window.localStorage.getItem("questions");')
  check_page.complete_check_with_correct_answers(questions.size, 'numpad')
  complete_page.wait_for_complete_page
  expect(complete_page).to have_completion_text
  storage1 = page.evaluate_script('window.localStorage;')
  @check_code = JSON.parse(storage1['pupil'])['checkCode']
  @school_uuid = JSON.parse(storage1['school'])['uuid']
  storage_audit_keys = storage1.keys.select {|x| x.include?('audit')}
  @audit = []
  storage_audit_keys.each do |key|
    @audit << (JSON.parse page.evaluate_script("window.localStorage.getItem('#{key}');"))
  end
  p @check_code
end

Then(/^I should have an expired pin$/) do
  visit Capybara.app_host + '/sign-out'
  AzureTableHelper.wait_for_received_check(@school_uuid, @check_code)
  Timeout.timeout(ENV['WAIT_TIME'].to_i) do
    sign_in_page.load;
    sign_in_page.login(@pupil_credentials[:school_password], @pupil_credentials[:pin]);
    sign_in_page.sign_in_button.click;
    confirmation_page.back_sign_in_page.click if confirmation_page.displayed?
    until sign_in_page.has_login_failure?
    end
  end
  expect(sign_in_page.login_failure).to be_all_there
end

Then(/^I should see a check started event in the audit log$/) do
  expect(@audit.select {|a| a['type'] == 'CheckStarted'}).to_not be_empty
  expect(@audit.select {|a| a['type'] == 'CheckStartedApiCalled'}).to_not be_empty
  expect(@audit.select {|a| a['type'] == 'CheckStartedAPICallSucceeded'}).to_not be_empty
end


Then(/^I should see a check start failure event recorded in the audit log$/) do
  storage1 = page.evaluate_script('window.localStorage;')
  storage_audit_keys = storage1.keys.select {|x| x.include?('audit')}
  local_storage = []
  storage_audit_keys.each do |key|
    local_storage << (JSON.parse page.evaluate_script("window.localStorage.getItem('#{key}');"))
  end

  expect(local_storage.select {|a| a['type'] == 'CheckStarted'}).to_not be_empty
  expect(local_storage.select {|a| a['type'] == 'CheckStartedApiCalled'}).to_not be_empty
  expect(local_storage.select {|a| a['type'] == 'CheckStartedAPICallFailed'}).to_not be_empty
end

Given(/^I have lost my local storage$/) do
  step 'I have generated a live pin'
  step 'I have logged in'
  confirmation_page.read_instructions.click
  start_page.start_warm_up.click
  warm_up_page.start_now.click
  step "I complete the warm up questions using the numpad"
  @questions = JSON.parse page.evaluate_script('window.localStorage.getItem("questions");')
  begin
    JSON.parse(page.evaluate_script('window.localStorage.clear();'))
  rescue TypeError
  end
end

When(/^I completed the check anyway$/) do
  warm_up_complete_page.start_check.click
  mtc_check_start_page.start_now.click
  check_page.complete_check_with_correct_answers(@questions.size, 'numpad')
  # expect(complete_page).to have_completion_text
end

When(/^I start the check$/) do
  confirmation_page.read_instructions.click if current_url.include? confirmation_page.url
  access_arrangements_setting_page.next_btn.click if current_url.include? access_arrangements_setting_page.url
  start_page.start_warm_up.click
  warm_up_page.start_now.click
  step 'I should be able to use the numpad to complete the warm up questions'
  warm_up_page.start_now.click
  mtc_check_start_page.start_now.click
  @time = Time.now
end

Then(/^I should see the check start time is recorded$/) do
  storage1 = page.evaluate_script('window.localStorage;')
  storage_audit_keys = storage1.keys.select {|x| x.include?('audit')}
  local_storage = []
  storage_audit_keys.each do |key|
    local_storage << (JSON.parse page.evaluate_script("window.localStorage.getItem('#{key}');"))
  end

  check_start_time = Time.parse(local_storage.select {|a| a['type'] == 'CheckStarted'}.first['clientTimestamp'])
  expect((check_start_time - @time).to_i).to eql 0
end
