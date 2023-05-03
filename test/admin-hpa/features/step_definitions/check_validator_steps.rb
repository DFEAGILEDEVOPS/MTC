Given(/^a pupil has completed the check with less than 25 answers$/) do
  step 'I have generated a live pin for a pupil'
  pupil_detail = SqlDbHelper.pupil_details(@details_hash[:upn], @school_id)
  @pupil_id = pupil_detail['id']
  check_entry = SqlDbHelper.check_details(@pupil_id)
  pupil_pin_detail = SqlDbHelper.get_pupil_pin(check_entry['id'])
  pupil_pin = pupil_pin_detail['val']
  school_password = SqlDbHelper.find_school(pupil_detail['school_id'])['pin']
  SafeTimeout.timeout(ENV['WAIT_TIME'].to_i) {sleep 1 until RequestHelper.auth(school_password, pupil_pin).code == 200}
  response_pupil_auth = RequestHelper.auth(school_password, pupil_pin)
  @parsed_response_pupil_auth = JSON.parse(response_pupil_auth.body)
  @submission_hash = RequestHelper.build_check_submission_message(@parsed_response_pupil_auth, nil, nil, 'mouse', {decreased_answers_set: true})
  AzureQueueHelper.create_check_submission_message(@submission_hash[:submission_message].to_json)
  @school_uuid = @parsed_response_pupil_auth['school']['uuid']
  @check_code = @parsed_response_pupil_auth['checkCode']
  @received_check = AzureTableHelper.wait_for_received_check(@school_uuid, @check_code)
  p @check_code
end

Then(/^I should see an error stating validation failed as there are 24 answers$/) do
  wait_until{AzureTableHelper.wait_for_received_check(@school_uuid, @check_code); !(AzureTableHelper.wait_for_received_check(@school_uuid, @check_code)['processingError']).nil?}
  @received_check = AzureTableHelper.wait_for_received_check(@school_uuid, @check_code)
  expect(@received_check['processingError']).to eql "check-validator: check validation failed. checkCode: #{@check_code}\n\t-\tsubmitted check has 24 answers"
end

Given(/^a pupil has completed the check with more than 25 answers$/) do
  step 'I have generated a live pin for a pupil'
  pupil_detail = SqlDbHelper.pupil_details(@details_hash[:upn], @school_id)
  @pupil_id = pupil_detail['id']
  check_entry = SqlDbHelper.check_details(@pupil_id)
  pupil_pin_detail = SqlDbHelper.get_pupil_pin(check_entry['id'])
  pupil_pin = pupil_pin_detail['val']
  school_password = SqlDbHelper.find_school(pupil_detail['school_id'])['pin']
  SafeTimeout.timeout(ENV['WAIT_TIME'].to_i) {sleep 1 until RequestHelper.auth(school_password, pupil_pin).code == 200}
  response_pupil_auth = RequestHelper.auth(school_password, pupil_pin)
  @parsed_response_pupil_auth = JSON.parse(response_pupil_auth.body)
  @submission_hash = RequestHelper.build_check_submission_message(@parsed_response_pupil_auth, nil, nil, 'mouse', {increased_answers_set: true})
  AzureQueueHelper.create_check_submission_message(@submission_hash[:submission_message].to_json)
  @school_uuid = @parsed_response_pupil_auth['school']['uuid']
  @check_code = @parsed_response_pupil_auth['checkCode']
  @received_check = AzureTableHelper.wait_for_received_check(@school_uuid, @check_code)
  p @check_code
end

Given(/^a pupil has completed the check with an answer that is not a string$/) do
  step 'I have generated a live pin for a pupil'
  pupil_detail = SqlDbHelper.pupil_details(@details_hash[:upn], @school_id)
  @pupil_id = pupil_detail['id']
  check_entry = SqlDbHelper.check_details(@pupil_id)
  pupil_pin_detail = SqlDbHelper.get_pupil_pin(check_entry['id'])
  pupil_pin = pupil_pin_detail['val']
  school_password = SqlDbHelper.find_school(pupil_detail['school_id'])['pin']
  SafeTimeout.timeout(ENV['WAIT_TIME'].to_i) {sleep 1 until RequestHelper.auth(school_password, pupil_pin).code == 200}
  response_pupil_auth = RequestHelper.auth(school_password, pupil_pin)
  @parsed_response_pupil_auth = JSON.parse(response_pupil_auth.body)
  @submission_hash = RequestHelper.build_check_submission_message(@parsed_response_pupil_auth, nil, nil, 'mouse', {answer_not_a_string: true})
  AzureQueueHelper.create_check_submission_message(@submission_hash[:submission_message].to_json)
  @school_uuid = @parsed_response_pupil_auth['school']['uuid']
  @check_code = @parsed_response_pupil_auth['checkCode']
  @received_check = AzureTableHelper.wait_for_received_check(@school_uuid, @check_code)
  p @check_code

end

Then(/^I should see an error stating validation failed as answers must be strings$/) do
  wait_until{AzureTableHelper.wait_for_received_check(@school_uuid, @check_code); !(AzureTableHelper.wait_for_received_check(@school_uuid, @check_code)['processingError']).nil?}
  @received_check = AzureTableHelper.wait_for_received_check(@school_uuid, @check_code)
  expect(@received_check['processingError']).to eql "check-validator: check validation failed. checkCode: #{@check_code}\n\t-\tanswer 26 is not of required type (string)"
end

Given(/^a pupil has completed the check with no audit logs$/) do
  step 'I have generated a live pin for a pupil'
  pupil_detail = SqlDbHelper.pupil_details(@details_hash[:upn], @school_id)
  @pupil_id = pupil_detail['id']
  check_entry = SqlDbHelper.check_details(@pupil_id)
  pupil_pin_detail = SqlDbHelper.get_pupil_pin(check_entry['id'])
  pupil_pin = pupil_pin_detail['val']
  school_password = SqlDbHelper.find_school(pupil_detail['school_id'])['pin']
  SafeTimeout.timeout(ENV['WAIT_TIME'].to_i) {sleep 1 until RequestHelper.auth(school_password, pupil_pin).code == 200}
  response_pupil_auth = RequestHelper.auth(school_password, pupil_pin)
  @parsed_response_pupil_auth = JSON.parse(response_pupil_auth.body)
  @submission_hash = RequestHelper.build_check_submission_message(@parsed_response_pupil_auth, nil, nil, 'mouse', {remove_audit: true})
  AzureQueueHelper.create_check_submission_message(@submission_hash[:submission_message].to_json)
  @school_uuid = @parsed_response_pupil_auth['school']['uuid']
  @check_code = @parsed_response_pupil_auth['checkCode']
  @received_check = AzureTableHelper.wait_for_received_check(@school_uuid, @check_code)
  p @check_code
end

Then(/^I should see an error stating validation failed as there is no audit log$/) do
  wait_until{AzureTableHelper.wait_for_received_check(@school_uuid, @check_code); !(AzureTableHelper.wait_for_received_check(@school_uuid, @check_code)['processingError']).nil?}
  @received_check = AzureTableHelper.wait_for_received_check(@school_uuid, @check_code)
  expect(@received_check['processingError']).to eql "check-validator: check validation failed. checkCode: #{@check_code}\n\t-\taudit property missing"
end

Given(/^a pupil has completed the check with answers that are not contained in an array$/) do
  step 'I have generated a live pin for a pupil'
  pupil_detail = SqlDbHelper.pupil_details(@details_hash[:upn], @school_id)
  @pupil_id = pupil_detail['id']
  check_entry = SqlDbHelper.check_details(@pupil_id)
  pupil_pin_detail = SqlDbHelper.get_pupil_pin(check_entry['id'])
  pupil_pin = pupil_pin_detail['val']
  school_password = SqlDbHelper.find_school(pupil_detail['school_id'])['pin']
  SafeTimeout.timeout(ENV['WAIT_TIME'].to_i) {sleep 1 until RequestHelper.auth(school_password, pupil_pin).code == 200}
  response_pupil_auth = RequestHelper.auth(school_password, pupil_pin)
  @parsed_response_pupil_auth = JSON.parse(response_pupil_auth.body)
  @submission_hash = RequestHelper.build_check_submission_message(@parsed_response_pupil_auth, nil, nil, 'mouse', {answers_not_array: true})
  AzureQueueHelper.create_check_submission_message(@submission_hash[:submission_message].to_json)
  @school_uuid = @parsed_response_pupil_auth['school']['uuid']
  @check_code = @parsed_response_pupil_auth['checkCode']
  @received_check = AzureTableHelper.wait_for_received_check(@school_uuid, @check_code)
  p @check_code
end

Then(/^I should see an error stating validation failed as answers are not an array$/) do
  wait_until{AzureTableHelper.wait_for_received_check(@school_uuid, @check_code); !(AzureTableHelper.wait_for_received_check(@school_uuid, @check_code)['processingError']).nil?}
  @received_check = AzureTableHelper.wait_for_received_check(@school_uuid, @check_code)
  expect(@received_check['processingError']).to eql "check-validator: check validation failed. checkCode: #{@check_code}\n\t-\tanswers property is not an array"
end


Given(/^a pupil has completed the check with the audit log is not contained in an array$/) do
  step 'I have generated a live pin for a pupil'
  pupil_detail = SqlDbHelper.pupil_details(@details_hash[:upn], @school_id)
  @pupil_id = pupil_detail['id']
  check_entry = SqlDbHelper.check_details(@pupil_id)
  pupil_pin_detail = SqlDbHelper.get_pupil_pin(check_entry['id'])
  pupil_pin = pupil_pin_detail['val']
  school_password = SqlDbHelper.find_school(pupil_detail['school_id'])['pin']
  SafeTimeout.timeout(ENV['WAIT_TIME'].to_i) {sleep 1 until RequestHelper.auth(school_password, pupil_pin).code == 200}
  response_pupil_auth = RequestHelper.auth(school_password, pupil_pin)
  @parsed_response_pupil_auth = JSON.parse(response_pupil_auth.body)
  @submission_hash = RequestHelper.build_check_submission_message(@parsed_response_pupil_auth, nil, nil, 'mouse', {audit_not_array: true})
  AzureQueueHelper.create_check_submission_message(@submission_hash[:submission_message].to_json)
  @school_uuid = @parsed_response_pupil_auth['school']['uuid']
  @check_code = @parsed_response_pupil_auth['checkCode']
  @received_check = AzureTableHelper.wait_for_received_check(@school_uuid, @check_code)
  p @check_code
end

Then(/^I should see an error stating validation failed as the audit log is not an array$/) do
  wait_until{AzureTableHelper.wait_for_received_check(@school_uuid, @check_code); !(AzureTableHelper.wait_for_received_check(@school_uuid, @check_code)['processingError']).nil?}
  @received_check = AzureTableHelper.wait_for_received_check(@school_uuid, @check_code)
  expect(@received_check['processingError']).to eql "check-validator: check validation failed. checkCode: #{@check_code}\n\t-\taudit property is not an array"
end


Given(/^a pupil has completed the check with a check code that is not a UUID$/) do
  step 'I have generated a live pin for a pupil'
  pupil_detail = SqlDbHelper.pupil_details(@details_hash[:upn], @school_id)
  @pupil_id = pupil_detail['id']
  check_entry = SqlDbHelper.check_details(@pupil_id)
  pupil_pin_detail = SqlDbHelper.get_pupil_pin(check_entry['id'])
  pupil_pin = pupil_pin_detail['val']
  school_password = SqlDbHelper.find_school(pupil_detail['school_id'])['pin']
  SafeTimeout.timeout(ENV['WAIT_TIME'].to_i) {sleep 1 until RequestHelper.auth(school_password, pupil_pin).code == 200}
  response_pupil_auth = RequestHelper.auth(school_password, pupil_pin)
  @parsed_response_pupil_auth = JSON.parse(response_pupil_auth.body)
  @submission_hash = RequestHelper.build_check_submission_message(@parsed_response_pupil_auth, nil, nil, 'mouse', {check_code_not_uuid: true})
  AzureQueueHelper.create_check_submission_message(@submission_hash[:submission_message].to_json)
  @school_uuid = @parsed_response_pupil_auth['school']['uuid']
  @check_code = @parsed_response_pupil_auth['checkCode'].gsub('-','')
  @received_check = AzureTableHelper.wait_for_received_check(@school_uuid, @check_code)
  p @check_code
end

Then(/^I should see an error stating validation failed as the check code is not a UUID$/) do
  wait_until{AzureTableHelper.wait_for_received_check(@school_uuid, @check_code); !(AzureTableHelper.wait_for_received_check(@school_uuid, @check_code)['processingError']).nil?}
  @received_check = AzureTableHelper.wait_for_received_check(@school_uuid, @check_code)
  expect(@received_check['processingError']).to eql "checkForm lookup failed:Validation failed for parameter 'checkCode'. Invalid GUID."
end


Given(/^a pupil has completed the check with the config property not being a object$/) do
  step 'I have generated a live pin for a pupil'
  pupil_detail = SqlDbHelper.pupil_details(@details_hash[:upn], @school_id)
  @pupil_id = pupil_detail['id']
  check_entry = SqlDbHelper.check_details(@pupil_id)
  pupil_pin_detail = SqlDbHelper.get_pupil_pin(check_entry['id'])
  pupil_pin = pupil_pin_detail['val']
  school_password = SqlDbHelper.find_school(pupil_detail['school_id'])['pin']
  SafeTimeout.timeout(ENV['WAIT_TIME'].to_i) {sleep 1 until RequestHelper.auth(school_password, pupil_pin).code == 200}
  response_pupil_auth = RequestHelper.auth(school_password, pupil_pin)
  @parsed_response_pupil_auth = JSON.parse(response_pupil_auth.body)
  @submission_hash = RequestHelper.build_check_submission_message(@parsed_response_pupil_auth, nil, nil, 'mouse', {config_not_object: true})
  AzureQueueHelper.create_check_submission_message(@submission_hash[:submission_message].to_json)
  @school_uuid = @parsed_response_pupil_auth['school']['uuid']
  @check_code = @parsed_response_pupil_auth['checkCode']
  @received_check = AzureTableHelper.wait_for_received_check(@school_uuid, @check_code)
  p @check_code
end

Then(/^I should see an error stating validation failed as the config property has to be an object$/) do
  wait_until{AzureTableHelper.wait_for_received_check(@school_uuid, @check_code); !(AzureTableHelper.wait_for_received_check(@school_uuid, @check_code)['processingError']).nil?}
  @received_check = AzureTableHelper.wait_for_received_check(@school_uuid, @check_code)
  expect(@received_check['processingError']).to eql "check-validator: check validation failed. checkCode: #{@check_code}\n\t-\tconfig property is not an object\n\t-\tonly live checks can be submitted. value:undefined"
end


Given(/^a pupil has completed the check with the inputs property not being a array$/) do
  step 'I have generated a live pin for a pupil'
  pupil_detail = SqlDbHelper.pupil_details(@details_hash[:upn], @school_id)
  @pupil_id = pupil_detail['id']
  check_entry = SqlDbHelper.check_details(@pupil_id)
  pupil_pin_detail = SqlDbHelper.get_pupil_pin(check_entry['id'])
  pupil_pin = pupil_pin_detail['val']
  school_password = SqlDbHelper.find_school(pupil_detail['school_id'])['pin']
  SafeTimeout.timeout(ENV['WAIT_TIME'].to_i) {sleep 1 until RequestHelper.auth(school_password, pupil_pin).code == 200}
  response_pupil_auth = RequestHelper.auth(school_password, pupil_pin)
  @parsed_response_pupil_auth = JSON.parse(response_pupil_auth.body)
  @submission_hash = RequestHelper.build_check_submission_message(@parsed_response_pupil_auth, nil, nil, 'mouse', {inputs_not_array: true})
  AzureQueueHelper.create_check_submission_message(@submission_hash[:submission_message].to_json)
  @school_uuid = @parsed_response_pupil_auth['school']['uuid']
  @check_code = @parsed_response_pupil_auth['checkCode']
  @received_check = AzureTableHelper.wait_for_received_check(@school_uuid, @check_code)
  p @check_code
end


Then(/^I should see an error stating validation failed as the inputs property has to be an array$/) do
  wait_until{AzureTableHelper.wait_for_received_check(@school_uuid, @check_code); !(AzureTableHelper.wait_for_received_check(@school_uuid, @check_code)['processingError']).nil?}
  @received_check = AzureTableHelper.wait_for_received_check(@school_uuid, @check_code)
  expect(@received_check['processingError']).to eql "check-validator: check validation failed. checkCode: #{@check_code}\n\t-\tinputs property is not an array"
end


Given(/^a pupil has completed the check with the practice property is set to true$/) do
  step 'I have generated a live pin for a pupil'
  pupil_detail = SqlDbHelper.pupil_details(@details_hash[:upn], @school_id)
  @pupil_id = pupil_detail['id']
  check_entry = SqlDbHelper.check_details(@pupil_id)
  pupil_pin_detail = SqlDbHelper.get_pupil_pin(check_entry['id'])
  pupil_pin = pupil_pin_detail['val']
  school_password = SqlDbHelper.find_school(pupil_detail['school_id'])['pin']
  SafeTimeout.timeout(ENV['WAIT_TIME'].to_i) {sleep 1 until RequestHelper.auth(school_password, pupil_pin).code == 200}
  response_pupil_auth = RequestHelper.auth(school_password, pupil_pin)
  @parsed_response_pupil_auth = JSON.parse(response_pupil_auth.body)
  @submission_hash = RequestHelper.build_check_submission_message(@parsed_response_pupil_auth, nil, nil, 'mouse', {practice: true})
  AzureQueueHelper.create_check_submission_message(@submission_hash[:submission_message].to_json)
  @school_uuid = @parsed_response_pupil_auth['school']['uuid']
  @check_code = @parsed_response_pupil_auth['checkCode']
  @received_check = AzureTableHelper.wait_for_received_check(@school_uuid, @check_code)
  p @check_code
end


Then(/^I should see an error stating validation failed as the practice property is set to true$/) do
  wait_until{AzureTableHelper.wait_for_received_check(@school_uuid, @check_code); !(AzureTableHelper.wait_for_received_check(@school_uuid, @check_code)['processingError']).nil?}
  @received_check = AzureTableHelper.wait_for_received_check(@school_uuid, @check_code)
  expect(@received_check['processingError']).to eql "check-validator: check validation failed. checkCode: #{@check_code}\n\t-\tonly live checks can be submitted. value:true"
end

Given(/^a pupil has completed the check with the pupil property not being an object$/) do
  step 'I have generated a live pin for a pupil'
  pupil_detail = SqlDbHelper.pupil_details(@details_hash[:upn], @school_id)
  @pupil_id = pupil_detail['id']
  check_entry = SqlDbHelper.check_details(@pupil_id)
  pupil_pin_detail = SqlDbHelper.get_pupil_pin(check_entry['id'])
  pupil_pin = pupil_pin_detail['val']
  school_password = SqlDbHelper.find_school(pupil_detail['school_id'])['pin']
  SafeTimeout.timeout(ENV['WAIT_TIME'].to_i) {sleep 1 until RequestHelper.auth(school_password, pupil_pin).code == 200}
  response_pupil_auth = RequestHelper.auth(school_password, pupil_pin)
  @parsed_response_pupil_auth = JSON.parse(response_pupil_auth.body)
  @submission_hash = RequestHelper.build_check_submission_message(@parsed_response_pupil_auth, nil, nil, 'mouse', {pupil_not_object: true})
  AzureQueueHelper.create_check_submission_message(@submission_hash[:submission_message].to_json)
  @school_uuid = @parsed_response_pupil_auth['school']['uuid']
  @check_code = @parsed_response_pupil_auth['checkCode']
  @received_check = AzureTableHelper.wait_for_received_check(@school_uuid, @check_code)
  p @check_code
end


Then(/^I should see an error stating validation failed as the pupil property is not a object$/) do
  wait_until{AzureTableHelper.wait_for_received_check(@school_uuid, @check_code); !(AzureTableHelper.wait_for_received_check(@school_uuid, @check_code)['processingError']).nil?}
  @received_check = AzureTableHelper.wait_for_received_check(@school_uuid, @check_code)
  expect(@received_check['processingError']).to eql "check-validator: check validation failed. checkCode: #{@check_code}\n\t-\tpupil property is not an object"
end

Given(/^a pupil has completed the check with the questions are not contained in an array$/) do
  step 'I have generated a live pin for a pupil'
  pupil_detail = SqlDbHelper.pupil_details(@details_hash[:upn], @school_id)
  @pupil_id = pupil_detail['id']
  check_entry = SqlDbHelper.check_details(@pupil_id)
  pupil_pin_detail = SqlDbHelper.get_pupil_pin(check_entry['id'])
  pupil_pin = pupil_pin_detail['val']
  school_password = SqlDbHelper.find_school(pupil_detail['school_id'])['pin']
  SafeTimeout.timeout(ENV['WAIT_TIME'].to_i) {sleep 1 until RequestHelper.auth(school_password, pupil_pin).code == 200}
  response_pupil_auth = RequestHelper.auth(school_password, pupil_pin)
  @parsed_response_pupil_auth = JSON.parse(response_pupil_auth.body)
  @submission_hash = RequestHelper.build_check_submission_message(@parsed_response_pupil_auth, nil, nil, 'mouse', {questions_not_array: true})
  AzureQueueHelper.create_check_submission_message(@submission_hash[:submission_message].to_json)
  @school_uuid = @parsed_response_pupil_auth['school']['uuid']
  @check_code = @parsed_response_pupil_auth['checkCode']
  @received_check = AzureTableHelper.wait_for_received_check(@school_uuid, @check_code)
  p @check_code
end

Then(/^I should see an error stating validation failed as the questions are not an array$/) do
  wait_until{AzureTableHelper.wait_for_received_check(@school_uuid, @check_code); !(AzureTableHelper.wait_for_received_check(@school_uuid, @check_code)['processingError']).nil?}
  @received_check = AzureTableHelper.wait_for_received_check(@school_uuid, @check_code)
  expect(@received_check['processingError']).to eql "check-validator: check validation failed. checkCode: #{@check_code}\n\t-\tquestions property is not an array"
end

Given(/^a pupil has completed the check with the school property not being an object$/) do
  step 'I have generated a live pin for a pupil'
  pupil_detail = SqlDbHelper.pupil_details(@details_hash[:upn], @school_id)
  @pupil_id = pupil_detail['id']
  check_entry = SqlDbHelper.check_details(@pupil_id)
  pupil_pin_detail = SqlDbHelper.get_pupil_pin(check_entry['id'])
  pupil_pin = pupil_pin_detail['val']
  school_password = SqlDbHelper.find_school(pupil_detail['school_id'])['pin']
  SafeTimeout.timeout(ENV['WAIT_TIME'].to_i) {sleep 1 until RequestHelper.auth(school_password, pupil_pin).code == 200}
  response_pupil_auth = RequestHelper.auth(school_password, pupil_pin)
  @parsed_response_pupil_auth = JSON.parse(response_pupil_auth.body)
  @submission_hash = RequestHelper.build_check_submission_message(@parsed_response_pupil_auth, nil, nil, 'mouse', {school_not_object: true})
  AzureQueueHelper.create_check_submission_message(@submission_hash[:submission_message].to_json)
  @school_uuid = @parsed_response_pupil_auth['school']['uuid']
  @check_code = @parsed_response_pupil_auth['checkCode']
  @received_check = AzureTableHelper.wait_for_received_check(@school_uuid, @check_code)
  p @check_code
end

Then(/^I should see an error stating validation failed as the school property is not a object$/) do
  wait_until{AzureTableHelper.wait_for_received_check(@school_uuid, @check_code); !(AzureTableHelper.wait_for_received_check(@school_uuid, @check_code)['processingError']).nil?}
  @received_check = AzureTableHelper.wait_for_received_check(@school_uuid, @check_code)
  expect(@received_check['processingError']).to eql "check-validator: check validation failed. checkCode: #{@check_code}\n\t-\tschool property is not an object"
end

Given(/^a pupil has completed the check with the tokens property not being an object$/) do
  step 'I have generated a live pin for a pupil'
  pupil_detail = SqlDbHelper.pupil_details(@details_hash[:upn], @school_id)
  @pupil_id = pupil_detail['id']
  check_entry = SqlDbHelper.check_details(@pupil_id)
  pupil_pin_detail = SqlDbHelper.get_pupil_pin(check_entry['id'])
  pupil_pin = pupil_pin_detail['val']
  school_password = SqlDbHelper.find_school(pupil_detail['school_id'])['pin']
  SafeTimeout.timeout(ENV['WAIT_TIME'].to_i) {sleep 1 until RequestHelper.auth(school_password, pupil_pin).code == 200}
  response_pupil_auth = RequestHelper.auth(school_password, pupil_pin)
  @parsed_response_pupil_auth = JSON.parse(response_pupil_auth.body)
  @submission_hash = RequestHelper.build_check_submission_message(@parsed_response_pupil_auth, nil, nil, 'mouse', {tokens_not_object: true})
  AzureQueueHelper.create_check_submission_message(@submission_hash[:submission_message].to_json)
  @school_uuid = @parsed_response_pupil_auth['school']['uuid']
  @check_code = @parsed_response_pupil_auth['checkCode']
  @received_check = AzureTableHelper.wait_for_received_check(@school_uuid, @check_code)
  p @check_code
end

Then(/^I should see an error stating validation failed as the tokens property is not a object$/) do
  wait_until{AzureTableHelper.wait_for_received_check(@school_uuid, @check_code); !(AzureTableHelper.wait_for_received_check(@school_uuid, @check_code)['processingError']).nil?}
  @received_check = AzureTableHelper.wait_for_received_check(@school_uuid, @check_code)
  expect(@received_check['processingError']).to eql "check-validator: check validation failed. checkCode: #{@check_code}\n\t-\ttokens property is not an object"
end
