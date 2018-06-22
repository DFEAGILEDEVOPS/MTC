Then(/^I should see device information populated in local storage$/) do
  device_info = JSON.parse(page.evaluate_script('window.localStorage.getItem("device");'))
  check_device_information(device_info)
end

Then(/^the device information should be persisted to the DB$/) do
  device_info = JSON.parse(page.evaluate_script('window.localStorage.getItem("device");'))
  check_code = JSON.parse(page.evaluate_script('window.localStorage.getItem("pupil");'))['checkCode']
  data = SqlDbHelper.get_check_data(check_code)
  local_info = JSON.parse data['data']
  db_device_info = local_info['data']['device']
  device_info['appUsageCounter']=1
  expect(db_device_info).to eql device_info
end

When(/^I go from the instructions page to the complete page$/) do
  confirmation_page.read_instructions.click
  start_page.start_warm_up.click
  warm_up_page.start_now.click
  step "I complete the warm up questions using the numpad"
  warm_up_complete_page.start_check.click
  mtc_check_start_page.start_now.click
  questions = JSON.parse page.evaluate_script('window.localStorage.getItem("questions");')
  @answers = check_page.complete_check_with_correct_answers(questions.size,'numpad')
  complete_page.wait_for_complete_page
  expect(complete_page).to have_completion_text
end


When(/^I have completed 2 checks$/) do
  step 'I have logged in'
  step 'I go from the instructions page to the complete page'
  complete_page.sign_out.click
  ct = Time.now
  new_time = Time.new(ct.year, ct.mon, ct.day, 22, 00, 00, "+02:00").strftime("%Y-%m-%d %H:%M:%S.%LZ")
  SqlDbHelper.expire_pin("Standard","Pupil",1,false)
  SqlDbHelper.reset_pin("Standard","Pupil",1, new_time, "9999")
  @pupil_information = SqlDbHelper.find_pupil_via_pin("9999")
  sign_in_page.login("abc12345","9999")
  sign_in_page.sign_in_button.click
  step 'I go from the instructions page to the complete page'
  check_code = JSON.parse(page.evaluate_script('window.localStorage.getItem("pupil");'))['checkCode']
  data = SqlDbHelper.get_check_data(check_code)
  local_info = JSON.parse data['data']
  @db_device_info = local_info['data']['device']
end

Then(/^the app counter should be set to (\d+)$/) do |count|
  expect(@db_device_info['appUsageCounter']).to eql count
end

Given(/^I have refreshed a page during the check$/) do
  step 'I am on question 5 of the check'
  step 'I attempt to refresh the page'
  step 'the next question has loaded so I continue with the check'
  check_code = JSON.parse(page.evaluate_script('window.localStorage.getItem("pupil");'))['checkCode']
  data = SqlDbHelper.get_check_data(check_code)
  local_info = JSON.parse data['data']
  @db_device_info = local_info['data']['device']
end