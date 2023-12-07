Given(/^a pupil has started a check$/) do
  name = (0...8).map {(65 + rand(26)).chr}.join
  step "I am logged in"
  step "I am on the add pupil page"
  step "I submit the form with the name fields set as #{name}"
  step "the pupil details should be stored"
  step "I am on the generate pupil pins page"
  step "I click Generate PINs button"
  generate_live_pins_overview_page.generate_pin_using_name(name)
  pupil_pin_row = view_and_print_live_pins_page.pupil_list.rows.find {|row| row.name.text == @details_hash[:last_name] + ', ' + @details_hash[:first_name]}
  @pupil_credentials = {:school_password => pupil_pin_row.school_password.text, :pin => pupil_pin_row.pin.text}
  AzureTableHelper.wait_for_prepared_check(@pupil_credentials[:school_password],@pupil_credentials[:pin])
  visit ENV["PUPIL_BASE_URL"] + check_sign_in_page.url
  p 'login credentials ' + @pupil_credentials[:school_password]+ ', ' + @pupil_credentials[:pin]
  check_sign_in_page.login(@pupil_credentials[:school_password], @pupil_credentials[:pin])
  check_sign_in_page.sign_in_button.click
  confirmation_page.read_instructions.click
  start_page.start_warm_up.click
  warm_up_page.start_now.click
  step "I complete the warm up questions using the numpad"
  warm_up_complete_page.start_check.click
  mtc_check_start_page.start_now.click
  sleep 3
end

Given(/^I complete the warm up questions using the (.+)$/) do |input_type|
  @warm_up_inputs = warm_up_page.complete_check_with_correct_answers(3, input_type)
end


When(/^I am on the Pupil Status page$/) do
  pupil_status_page.load
end


Given(/^there is a processing error with a check$/) do
  step 'I have generated a live pin for a pupil'
  pupil_detail = SqlDbHelper.pupil_details(@details_hash[:upn], @school_id)
  pupil_id = pupil_detail['id']
  check_entry = SqlDbHelper.check_details(pupil_id)
  pupil_pin_detail = SqlDbHelper.get_pupil_pin(check_entry['id'])
  pupil_pin = pupil_pin_detail['val']
  school_password = SqlDbHelper.find_school(pupil_detail['school_id'])['pin']

  Timeout.timeout(ENV['WAIT_TIME'].to_i) {sleep 1 until RequestHelper.auth(school_password, pupil_pin).code == 200}
  response_pupil_auth = RequestHelper.auth(school_password, pupil_pin)
  @parsed_response_pupil_auth = JSON.parse(response_pupil_auth.body)
  @submission_hash = RequestHelper.build_check_submission_message(@parsed_response_pupil_auth, nil, true)
  payload = @submission_hash[:submission_message]
  jwt =  @submission_hash[:payload][:tokens]['checkSubmission']["token"]
  RequestHelper.submit_check(jwt, payload)
  school_uuid = @parsed_response_pupil_auth['school']['uuid']
  @check_code = @parsed_response_pupil_auth['checkCode']
  AzureTableHelper.wait_for_received_check(school_uuid, @check_code)
end

And(/^I should see how many days I have left and when the check window closes$/) do
  check_end_date = SqlDbHelper.check_window_details('Development Phase')['checkEndDate']
  expected_days_left = pupil_status_page.not_started_checks_details.window_info.text.split('.')[0].scan(/\d/).join('').to_i
  actual_days_left =((check_end_date - Time.now) / 60 /60 /24).to_i
  expect(actual_days_left).to eql expected_days_left
end


And(/^I should see a red error box at the top of the page$/) do
  expect(pupil_status_page).to have_warning_message
  expect(pupil_status_page.warning_message.text).to eql "#{pupil_status_page.checks_that_require_action.count.text} Check with errors"
end


Given(/^I have logged in to the check$/) do
  step 'I have generated a live pin for a pupil'
  resp = RequestHelper.auth(@pupil_credentials[:school_password],@pupil_credentials[:pin])
  expect(resp.code).to eql 200
end

Then(/^the counts should equal the total number of pupils in the school$/) do
 page_total = (pupil_status_page.checks_that_require_action.count.text.to_i +
  pupil_status_page.pupils_not_started.count.text.to_i +
  pupil_status_page.pupils_in_progress.count.text.to_i +
  pupil_status_page.pupils_completed.count.text.to_i)
  db_total = SqlDbHelper.list_of_pupils_from_school(SqlDbHelper.find_teacher(@user)['school_id']).count
  expect(page_total).to eql db_total
end

And(/^all other pupils are not taking the check$/) do
  pupils_not_taking_check_page.load
  step 'I want to add a reason'
  pupil_reason_page.attendance_codes.first.click
  pupil_reason_page.select_all_pupils.click
  pupil_reason_page.sticky_banner.confirm.click
end

And(/^the HDF cannot be signed$/) do
  hdf_form_page.load
  expect(hdf_form_page).to_not have_first_name
  expect(hdf_form_page).to_not have_last_name
  expect(hdf_form_page).to_not have_is_headteacher_yes
  expect(hdf_form_page).to_not have_is_headteacher_no
  expect(hdf_form_page).to_not have_continue
end

When(/^the check period closes and the admin period is still active$/) do
  SqlDbHelper.update_check_end_date((Date.today)-2)
end

Then(/^the pupil with the processing error can have a reason for not taking the check applied$/) do
  pupils_not_taking_check_page.load
  step 'I want to add a reason'
  wait_until(60, 1) {sleep 1; visit current_url; pupil_reason_page.has_attendance_codes?}
  pupil_reason_page.attendance_codes.first.click
  expect(pupil_reason_page.pupil_list.rows.first.name.text).to eql "#{@details_hash[:last_name]}, #{@details_hash[:first_name]}"
  pupil_reason_page.select_pupil(@details_hash[:last_name])
  pupil_reason_page.sticky_banner.confirm.click
end

And(/^then the HDF can be signed$/) do
  step 'I am on the HDF form page'
  step 'I submit the form with the hdf name fields set as Test'
  declaration_review_pupils_page.continue_button.click
  step 'I submit the form with confirmation'
  step 'I can see the declaration submitted page as per the design'
end
