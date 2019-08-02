Then(/^I should see device information populated in local storage$/) do
  device_info = JSON.parse(page.evaluate_script('window.localStorage.getItem("device");'))
  check_device_information(device_info)
end

Then(/^the device information should be persisted to the DB$/) do
  device_info = JSON.parse(page.evaluate_script('window.localStorage.getItem("device");'))
  check_code = JSON.parse(page.evaluate_script('window.localStorage.getItem("pupil");'))['checkCode']
  wait_until(60, 1){SqlDbHelper.get_check(check_code)['id']}
  check_id = SqlDbHelper.get_check(check_code)['id']
  wait_until(60, 1){SqlDbHelper.get_check_result(check_id)}
  data = SqlDbHelper.get_check_result(check_id)
  local_info = JSON.parse data['payload']
  db_device_info = local_info['device']
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
  step 'I have generated a live pin'
  @pupil_1 = @pupil_credentials
  step 'I have generated a live pin'
  @pupil_2 = @pupil_credentials
  sign_in_page.load unless sign_in_page.displayed?
  [@pupil_1,@pupil_2].each do |login_details|
    p 'login credentials ' + login_details[:school_password]+ ', ' + login_details[:pin]
    sign_in_page.login(login_details[:school_password], login_details[:pin])
    sign_in_page.sign_in_button.click
    confirmation_page.read_instructions.click
    start_page.start_warm_up.click
    warm_up_page.start_now.click
    step "I complete the warm up questions using the numpad"
    warm_up_complete_page.start_check.click
    mtc_check_start_page.start_now.click
    questions = JSON.parse page.evaluate_script('window.localStorage.getItem("questions");')
    @answers = check_page.complete_check_with_correct_answers(questions.size,'numpad')
    complete_page.wait_for_complete_page
    expect(complete_page).to have_heading
    @check_code = JSON.parse(page.evaluate_script('window.localStorage.getItem("pupil");'))['checkCode']
    complete_page.sign_out.click
    Timeout.timeout(8){sleep 0.2 until current_url.include? sign_in_page.url}
  end
end

Then(/^the app counter should be set to (\d+)$/) do |count|
  db_payload = JSON.parse (SqlDbHelper.get_check_result(SqlDbHelper.get_check(@check_code)['id'])['payload'])
    expect(db_payload['device']['appUsageCounter']).to eql count
end

Given(/^I have refreshed a page during the check$/) do
  step 'I have generated a live pin'
  step 'I am on question 1 of the check'
  step 'I attempt to refresh the page'
  step 'the next question has loaded so I continue with the check'
  @check_code = JSON.parse(page.evaluate_script('window.localStorage.getItem("pupil");'))['checkCode']
end
