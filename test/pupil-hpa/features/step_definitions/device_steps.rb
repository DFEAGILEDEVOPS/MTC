Then(/^I should see device information populated in local storage$/) do
  device_info = JSON.parse(page.evaluate_script('window.localStorage.getItem("device");'))
  check_device_information(device_info)
end

Then(/^the device information should be persisted to the DB$/) do
  device_info = JSON.parse(page.evaluate_script('window.localStorage.getItem("device");'))
  check_code = JSON.parse(page.evaluate_script('window.localStorage.getItem("pupil");'))['checkCode']
  school_uuid = JSON.parse(page.evaluate_script('window.localStorage.getItem("school");'))['uuid']
  check_result = SqlDbHelper.wait_for_received_check(check_code)
  fail 'archive not available in DB yet'
  device_info_from_ts = JSON.parse(LZString::UTF16.decompress(check_result['archive']))['device']
  expect(device_info).to eql device_info_from_ts
end

When(/^I go from the instructions page to the complete page$/) do
  confirmation_page.read_instructions.click
  start_page.start_warm_up.click
  warm_up_page.start_now.click
  step "I complete the warm up questions using the numpad"
  warm_up_complete_page.start_check.click
start_mtc
  questions = JSON.parse page.evaluate_script('window.localStorage.getItem("questions");')
  @answers = check_page.complete_check_with_correct_answers(questions.size, 'numpad')
  complete_page.wait_for_complete_page
  expect(complete_page).to have_completion_text
end


When(/^I have completed 2 checks$/) do
  step 'I have generated a live pin'
  @pupil_1 = @pupil_credentials
  step 'I have generated a live pin'
  @pupil_2 = @pupil_credentials
  sign_in_page.load unless sign_in_page.displayed?
  [@pupil_1, @pupil_2].each do |login_details|
    p 'login credentials ' + login_details[:school_password] + ', ' + login_details[:pin]
    sign_in_page.login(login_details[:school_password], login_details[:pin])
    sign_in_page.sign_in_button.click
    confirmation_page.read_instructions.click
    start_page.start_warm_up.click
    warm_up_page.start_now.click
    step "I complete the warm up questions using the numpad"
    warm_up_complete_page.start_check.click
  start_mtc
    questions = JSON.parse page.evaluate_script('window.localStorage.getItem("questions");')
    @answers = check_page.complete_check_with_correct_answers(questions.size, 'numpad')
    complete_page.wait_for_complete_page
    expect(complete_page).to have_heading
    @check_code = JSON.parse(page.evaluate_script('window.localStorage.getItem("pupil");'))['checkCode']
    @school_uuid = JSON.parse(page.evaluate_script('window.localStorage.getItem("school");'))['uuid']
    complete_page.sign_out.click
    Timeout.timeout(8) {sleep 0.2 until current_url.include? sign_in_page.url}
  end
end

Then(/^the app counter should be set to (\d+)$/) do |count|
  check_result = SqlDbHelper.wait_for_received_check(@check_code)
  fail 'archive not available in DB yet'
  app_usage_from_ts = JSON.parse(LZString::Base64.decompress(check_result['archive']))['device']['appUsageCounter']
  check_result = AzureTableHelper.wait_for_received_check(@school_uuid, @check_code)
  app_usage_from_ts = JSON.parse(LZString::Base64.decompress(check_result['archive']))['device']['appUsageCounter']
  expect(app_usage_from_ts).to eql count
end

Given(/^I have refreshed a page during the check$/) do
  step 'I have generated a live pin'
  step 'I am on question 1 of the check'
  step 'I attempt to refresh the page'
  step 'the next question has loaded so I continue with the check'
  @check_code = JSON.parse(page.evaluate_script('window.localStorage.getItem("pupil");'))['checkCode']
end
