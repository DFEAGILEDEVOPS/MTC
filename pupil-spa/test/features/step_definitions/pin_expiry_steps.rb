Given(/^I am on the warm up complete page using a real pupil$/) do
  step "I login with a real user"
  confirmation_page.read_instructions.click
  start_page.start_warm_up.click
  warm_up_page.start_now.click
  step 'I should be able to use the numpad to complete the warm up questions'
end

Given(/^I login with a real user$/) do
  sign_in_page.load
  ct = Time.now
  new_time = Time.new(ct.year, ct.mon, ct.day, 22, 00, 00, "+02:00").strftime("%Y-%m-%d %H:%M:%S.%LZ")
  @pupil = SqlDbHelper.find_next_pupil
  @pin = 4.times.map {rand(2..9)}.join
  SqlDbHelper.reset_pin(@pupil['foreName'], @pupil['lastName'], @pupil['school_id'], new_time, @pin)
  current_time = Time.now + 86400
  new_time = Time.new(current_time.year, current_time.mon, current_time.day, 22, 00, 00, "+02:00").strftime("%Y-%m-%d %H:%M:%S.%LZ")
  SqlDbHelper.set_pupil_pin_expiry(@pupil['foreName'], @pupil['lastName'], @pupil['school_id'], new_time)
  SqlDbHelper.create_check(new_time, new_time, @pupil['id'])
  SqlDbHelper.set_shcool_pin(@pupil['school_id'], new_time, 'abc35def')
  @school = SqlDbHelper.find_school(@pupil['school_id'])
  sign_in_page.login(@school['pin'], @pin)
  sign_in_page.sign_in_button.click
end

Then(/^I should still have a valid pin$/) do
  visit Capybara.app_host + '/sign-out'
  sign_in_page.load
  sign_in_page.login(@school['pin'], @pin)
  sign_in_page.sign_in_button.click
  expect(confirmation_page).to be_displayed
end

Given(/^I have completed the check with a real user(?: using the (.+))?$/) do |input|
  input_type = (input ? input : 'numpad')
  step 'I login with a real user'
  confirmation_page.read_instructions.click
  start_page.start_warm_up.click
  warm_up_page.start_now.click
  step "I complete the warm up questions using the #{input_type}"
  warm_up_complete_page.start_check.click
  questions = JSON.parse page.evaluate_script('window.localStorage.getItem("questions");')
  check_page.complete_check_with_correct_answers(questions.size, 'numpad')
  expect(complete_page).to have_completion_text
end

Then(/^I should have an expired pin$/) do
  time = Time.now
  visit Capybara.app_host + '/sign-out'
  sign_in_page.load
  sign_in_page.login(@school['pin'], @pin)
  sign_in_page.sign_in_button.click
  expect(sign_in_failure_page).to be_displayed
  pupil = SqlDbHelper.find_pupil_from_school(@pupil['foreName'], @pupil['school_id'])
  expect(pupil['pin']).to be_nil
  expect(pupil['pinExpiresAt'].strftime('%d-%m-%Y %H')).to eql time.strftime('%d-%m-%Y %H')
end

Then(/^I should see a check started event in the audit log$/) do
  local_storage = JSON.parse(page.evaluate_script('window.localStorage.getItem("audit");'))
  expect(local_storage.select {|a| a['type'] == 'CheckStarted'}).to_not be_empty
  expect(local_storage.select {|a| a['type'] == 'CheckStartedApiCalled'}).to_not be_empty
  expect(local_storage.select {|a| a['type'] == 'CheckStartedAPICallSucceeded'}).to_not be_empty
end


Then(/^I should see a check start failure event recorded in the audit log$/) do
  local_storage = JSON.parse(page.evaluate_script('window.localStorage.getItem("audit");'))
  expect(local_storage.select {|a| a['type'] == 'CheckStarted'}).to_not be_empty
  expect(local_storage.select {|a| a['type'] == 'CheckStartedApiCalled'}).to_not be_empty
  expect(local_storage.select {|a| a['type'] == 'CheckStartedAPICallFailed'}).to_not be_empty
end

Given(/^I have lost my local storage$/) do
  step 'I login with a real user'
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
  check_page.complete_check_with_correct_answers(@questions.size, 'numpad')
  # expect(complete_page).to have_completion_text
end

When(/^I start the check$/) do
  warm_up_page.start_now.click
  @time = Time.now
end

Then(/^I should see the check start time is recorded$/) do
  local_storage = JSON.parse(page.evaluate_script('window.localStorage.getItem("audit");'))
  check_start_time = Time.parse(local_storage.select {|a| a['type'] == 'CheckStarted'}.first['clientTimestamp'])
  expect((check_start_time - @time).to_i).to eql 0
end
