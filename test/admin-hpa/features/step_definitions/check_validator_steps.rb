Given(/^a pupil has completed the check with less than 25 answers$/) do
  step 'I have generated a live pin for a pupil'
  pupil_detail = SqlDbHelper.pupil_details(@details_hash[:upn], @school_id)
  @pupil_id = pupil_detail['id']
  check_entry = SqlDbHelper.check_details(@pupil_id)
  pupil_pin_detail = SqlDbHelper.get_pupil_pin(check_entry['id'])
  pupil_pin = pupil_pin_detail['val']
  school_password = SqlDbHelper.find_school(pupil_detail['school_id'])['pin']
  Timeout.timeout(ENV['WAIT_TIME'].to_i) {sleep 1 until RequestHelper.auth(school_password, pupil_pin).code == 200}
  response_pupil_auth = RequestHelper.auth(school_password, pupil_pin)
  @parsed_response_pupil_auth = JSON.parse(response_pupil_auth.body)
  @submission_hash = RequestHelper.build_check_submission_message(@parsed_response_pupil_auth, nil, nil, 'mouse', {decreased_answers_set: true})
  payload = @submission_hash[:submission_message]
  jwt =  @submission_hash[:payload][:tokens]['checkSubmission']["token"]
  RequestHelper.submit_check(jwt, payload)
  @school_uuid = @parsed_response_pupil_auth['school']['uuid']
  @check_code = @parsed_response_pupil_auth['checkCode']
  @received_check = SqlDbHelper.wait_for_received_check(@check_code)
  p @check_code
end

Then(/^I should see an error stating validation failed as there are 24 answers$/) do
  wait_until{SqlDbHelper.wait_for_received_check(@check_code); !(SqlDbHelper.wait_for_received_check(@check_code)['processingFailed']).nil?}
  SqlDbHelper.wait_for_received_check(@check_code)
  storage_row = AzureTableHelper.get_row('receivedCheck', @school['urlSlug'], @check_code)
  expect(storage_row['checkVersion']).to eql 3
  expect(storage_row['processingError']).to eql "check-validator: check validation failed. checkCode: #{@check_code}\n\t-\tsubmitted check has 24 answers. 25 answers are required}"
end

Given(/^a pupil has completed the check with more than 25 answers$/) do
  step 'I have generated a live pin for a pupil'
  pupil_detail = SqlDbHelper.pupil_details(@details_hash[:upn], @school_id)
  @pupil_id = pupil_detail['id']
  check_entry = SqlDbHelper.check_details(@pupil_id)
  pupil_pin_detail = SqlDbHelper.get_pupil_pin(check_entry['id'])
  pupil_pin = pupil_pin_detail['val']
  school_password = SqlDbHelper.find_school(pupil_detail['school_id'])['pin']
  Timeout.timeout(ENV['WAIT_TIME'].to_i) {sleep 1 until RequestHelper.auth(school_password, pupil_pin).code == 200}
  response_pupil_auth = RequestHelper.auth(school_password, pupil_pin)
  @parsed_response_pupil_auth = JSON.parse(response_pupil_auth.body)
  @submission_hash = RequestHelper.build_check_submission_message(@parsed_response_pupil_auth, nil, nil, 'mouse', {increased_answers_set: true})
  payload = @submission_hash[:submission_message]
  jwt =  @submission_hash[:payload][:tokens]['checkSubmission']["token"]
  RequestHelper.submit_check(jwt, payload)
  @school_uuid = @parsed_response_pupil_auth['school']['uuid']
  @check_code = @parsed_response_pupil_auth['checkCode']
  @received_check = SqlDbHelper.wait_for_received_check(@check_code)
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
  Timeout.timeout(ENV['WAIT_TIME'].to_i) {sleep 1 until RequestHelper.auth(school_password, pupil_pin).code == 200}
  response_pupil_auth = RequestHelper.auth(school_password, pupil_pin)
  @parsed_response_pupil_auth = JSON.parse(response_pupil_auth.body)
  @submission_hash = RequestHelper.build_check_submission_message(@parsed_response_pupil_auth, nil, nil, 'mouse', {answer_not_a_string: true})
  payload = @submission_hash[:submission_message]
  jwt =  @submission_hash[:payload][:tokens]['checkSubmission']["token"]
  RequestHelper.submit_check(jwt, payload)
  @school_uuid = @parsed_response_pupil_auth['school']['uuid']
  @check_code = @parsed_response_pupil_auth['checkCode']
  @received_check = SqlDbHelper.wait_for_received_check(@check_code)
  p @check_code
end

Then(/^I should see an error stating validation failed as answers must be strings$/) do
  wait_until{SqlDbHelper.wait_for_received_check(@check_code); !(SqlDbHelper.wait_for_received_check(@check_code)['processingFailed']).nil?}
  @received_check = SqlDbHelper.wait_for_received_check(@check_code)
  expect(@received_check['processingFailed']).to eql true
end

Given(/^a pupil has completed the check with no audit logs$/) do
  step 'I have generated a live pin for a pupil'
  pupil_detail = SqlDbHelper.pupil_details(@details_hash[:upn], @school_id)
  @pupil_id = pupil_detail['id']
  check_entry = SqlDbHelper.check_details(@pupil_id)
  pupil_pin_detail = SqlDbHelper.get_pupil_pin(check_entry['id'])
  pupil_pin = pupil_pin_detail['val']
  school_password = SqlDbHelper.find_school(pupil_detail['school_id'])['pin']
  Timeout.timeout(ENV['WAIT_TIME'].to_i) {sleep 1 until RequestHelper.auth(school_password, pupil_pin).code == 200}
  response_pupil_auth = RequestHelper.auth(school_password, pupil_pin)
  @parsed_response_pupil_auth = JSON.parse(response_pupil_auth.body)
  @submission_hash = RequestHelper.build_check_submission_message(@parsed_response_pupil_auth, nil, nil, 'mouse', {remove_audit: true})
  payload = @submission_hash[:submission_message]
  jwt =  @submission_hash[:payload][:tokens]['checkSubmission']["token"]
  RequestHelper.submit_check(jwt, payload)
  @school_uuid = @parsed_response_pupil_auth['school']['uuid']
  @check_code = @parsed_response_pupil_auth['checkCode']
  @received_check = SqlDbHelper.wait_for_received_check(@check_code)
  p @check_code
end

Then(/^I should see an error stating validation failed as there is no audit log$/) do
  wait_until{SqlDbHelper.wait_for_received_check(@check_code); !(SqlDbHelper.wait_for_received_check(@check_code)['processingFailed']).nil?}
  @received_check = SqlDbHelper.wait_for_received_check(@check_code)
  expect(@received_check['processingFailed']).to eql true
end

Given(/^a pupil has completed the check with answers that are not contained in an array$/) do
  step 'I have generated a live pin for a pupil'
  pupil_detail = SqlDbHelper.pupil_details(@details_hash[:upn], @school_id)
  @pupil_id = pupil_detail['id']
  check_entry = SqlDbHelper.check_details(@pupil_id)
  pupil_pin_detail = SqlDbHelper.get_pupil_pin(check_entry['id'])
  pupil_pin = pupil_pin_detail['val']
  school_password = SqlDbHelper.find_school(pupil_detail['school_id'])['pin']
  Timeout.timeout(ENV['WAIT_TIME'].to_i) {sleep 1 until RequestHelper.auth(school_password, pupil_pin).code == 200}
  response_pupil_auth = RequestHelper.auth(school_password, pupil_pin)
  @parsed_response_pupil_auth = JSON.parse(response_pupil_auth.body)
  @submission_hash = RequestHelper.build_check_submission_message(@parsed_response_pupil_auth, nil, nil, 'mouse', {answers_not_array: true})
  payload = @submission_hash[:submission_message]
  jwt =  @submission_hash[:payload][:tokens]['checkSubmission']["token"]
  RequestHelper.submit_check(jwt, payload)
  @school_uuid = @parsed_response_pupil_auth['school']['uuid']
  @check_code = @parsed_response_pupil_auth['checkCode']
  @received_check = SqlDbHelper.wait_for_received_check(@check_code)
  p @check_code
end

Then(/^I should see an error stating validation failed as answers are not an array$/) do
  wait_until{SqlDbHelper.wait_for_received_check(@check_code); !(SqlDbHelper.wait_for_received_check(@check_code)['processingFailed']).nil?}
  @received_check = SqlDbHelper.wait_for_received_check(@check_code)
  expect(@received_check['processingFailed']).to eql true
end


Given(/^a pupil has completed the check with the audit log is not contained in an array$/) do
  step 'I have generated a live pin for a pupil'
  pupil_detail = SqlDbHelper.pupil_details(@details_hash[:upn], @school_id)
  @pupil_id = pupil_detail['id']
  check_entry = SqlDbHelper.check_details(@pupil_id)
  pupil_pin_detail = SqlDbHelper.get_pupil_pin(check_entry['id'])
  pupil_pin = pupil_pin_detail['val']
  school_password = SqlDbHelper.find_school(pupil_detail['school_id'])['pin']
  Timeout.timeout(ENV['WAIT_TIME'].to_i) {sleep 1 until RequestHelper.auth(school_password, pupil_pin).code == 200}
  response_pupil_auth = RequestHelper.auth(school_password, pupil_pin)
  @parsed_response_pupil_auth = JSON.parse(response_pupil_auth.body)
  @submission_hash = RequestHelper.build_check_submission_message(@parsed_response_pupil_auth, nil, nil, 'mouse', {audit_not_array: true})
  payload = @submission_hash[:submission_message]
  jwt =  @submission_hash[:payload][:tokens]['checkSubmission']["token"]
  RequestHelper.submit_check(jwt, payload)
  @school_uuid = @parsed_response_pupil_auth['school']['uuid']
  @check_code = @parsed_response_pupil_auth['checkCode']
  @received_check = SqlDbHelper.wait_for_received_check(@check_code)
  p @check_code
end

Then(/^I should see an error stating validation failed as the audit log is not an array$/) do
  wait_until{SqlDbHelper.wait_for_received_check(@check_code); !(SqlDbHelper.wait_for_received_check(@check_code)['processingFailed']).nil?}
  @received_check = SqlDbHelper.wait_for_received_check(@check_code)
  expect(@received_check['processingFailed']).to eql true
end


Given(/^a pupil has completed the check with a check code that is not a UUID$/) do
  step 'I have generated a live pin for a pupil'
  pupil_detail = SqlDbHelper.pupil_details(@details_hash[:upn], @school_id)
  @pupil_id = pupil_detail['id']
  check_entry = SqlDbHelper.check_details(@pupil_id)
  pupil_pin_detail = SqlDbHelper.get_pupil_pin(check_entry['id'])
  pupil_pin = pupil_pin_detail['val']
  school_password = SqlDbHelper.find_school(pupil_detail['school_id'])['pin']
  Timeout.timeout(ENV['WAIT_TIME'].to_i) {sleep 1 until RequestHelper.auth(school_password, pupil_pin).code == 200}
  response_pupil_auth = RequestHelper.auth(school_password, pupil_pin)
  @parsed_response_pupil_auth = JSON.parse(response_pupil_auth.body)
  @submission_hash = RequestHelper.build_check_submission_message(@parsed_response_pupil_auth, nil, nil, 'mouse', {check_code_not_uuid: true})
  payload = @submission_hash[:submission_message]
  jwt =  @submission_hash[:payload][:tokens]['checkSubmission']["token"]
  RequestHelper.submit_check(jwt, payload)
  @school_uuid = @parsed_response_pupil_auth['school']['uuid']
  @check_code = @parsed_response_pupil_auth['checkCode']
  @received_check = SqlDbHelper.wait_for_received_check(@check_code)
  p @check_code
end

Then(/^I should see an error stating validation failed as the check code is not a UUID$/) do
  SqlDbHelper.wait_for_received_check(@check_code)
  received_check = AzureTableHelper.get_row('receivedCheck', @school['urlSlug'], @check_code.gsub("-", ''))
  expect(received_check['processingError']).to eql "checkForm lookup failed:Validation failed for parameter 'checkCode'. Invalid GUID."
end


Given(/^a pupil has completed the check with the config property not being a object$/) do
  step 'I have generated a live pin for a pupil'
  pupil_detail = SqlDbHelper.pupil_details(@details_hash[:upn], @school_id)
  @pupil_id = pupil_detail['id']
  check_entry = SqlDbHelper.check_details(@pupil_id)
  pupil_pin_detail = SqlDbHelper.get_pupil_pin(check_entry['id'])
  pupil_pin = pupil_pin_detail['val']
  school_password = SqlDbHelper.find_school(pupil_detail['school_id'])['pin']
  Timeout.timeout(ENV['WAIT_TIME'].to_i) {sleep 1 until RequestHelper.auth(school_password, pupil_pin).code == 200}
  response_pupil_auth = RequestHelper.auth(school_password, pupil_pin)
  @parsed_response_pupil_auth = JSON.parse(response_pupil_auth.body)
  @submission_hash = RequestHelper.build_check_submission_message(@parsed_response_pupil_auth, nil, nil, 'mouse', {config_not_object: true})
  payload = @submission_hash[:submission_message]
  jwt =  @submission_hash[:payload][:tokens]['checkSubmission']["token"]
  RequestHelper.submit_check(jwt, payload)
  @school_uuid = @parsed_response_pupil_auth['school']['uuid']
  @check_code = @parsed_response_pupil_auth['checkCode']
  @received_check = SqlDbHelper.wait_for_received_check(@check_code)
  p @check_code
end

Then(/^I should see an error stating validation failed as the config property has to be an object$/) do
  wait_until{SqlDbHelper.wait_for_received_check(@check_code); !(SqlDbHelper.wait_for_received_check(@check_code)['processingFailed']).nil?}
  sleep 5
  @received_check = SqlDbHelper.wait_for_received_check(@check_code)
  expect(@received_check['processingFailed']).to eql true
end


Given(/^a pupil has completed the check with the inputs property not being a array$/) do
  step 'I have generated a live pin for a pupil'
  pupil_detail = SqlDbHelper.pupil_details(@details_hash[:upn], @school_id)
  @pupil_id = pupil_detail['id']
  check_entry = SqlDbHelper.check_details(@pupil_id)
  pupil_pin_detail = SqlDbHelper.get_pupil_pin(check_entry['id'])
  pupil_pin = pupil_pin_detail['val']
  school_password = SqlDbHelper.find_school(pupil_detail['school_id'])['pin']
  Timeout.timeout(ENV['WAIT_TIME'].to_i) {sleep 1 until RequestHelper.auth(school_password, pupil_pin).code == 200}
  response_pupil_auth = RequestHelper.auth(school_password, pupil_pin)
  @parsed_response_pupil_auth = JSON.parse(response_pupil_auth.body)
  @submission_hash = RequestHelper.build_check_submission_message(@parsed_response_pupil_auth, nil, nil, 'mouse', {inputs_not_array: true})
  payload = @submission_hash[:submission_message]
  jwt =  @submission_hash[:payload][:tokens]['checkSubmission']["token"]
  RequestHelper.submit_check(jwt, payload)
  @school_uuid = @parsed_response_pupil_auth['school']['uuid']
  @check_code = @parsed_response_pupil_auth['checkCode']
  @received_check = SqlDbHelper.wait_for_received_check(@check_code)
  p @check_code
end


Then(/^I should see an error stating validation failed as the inputs property has to be an array$/) do
  wait_until{SqlDbHelper.wait_for_received_check(@check_code); !(SqlDbHelper.wait_for_received_check(@check_code)['processingFailed']).nil?}
  @received_check = SqlDbHelper.wait_for_received_check(@check_code)
  expect(@received_check['processingFailed']).to eql true
end


Given(/^a pupil has completed the check with the practice property is set to true$/) do
  step 'I have generated a live pin for a pupil'
  pupil_detail = SqlDbHelper.pupil_details(@details_hash[:upn], @school_id)
  @pupil_id = pupil_detail['id']
  check_entry = SqlDbHelper.check_details(@pupil_id)
  pupil_pin_detail = SqlDbHelper.get_pupil_pin(check_entry['id'])
  pupil_pin = pupil_pin_detail['val']
  school_password = SqlDbHelper.find_school(pupil_detail['school_id'])['pin']
  Timeout.timeout(ENV['WAIT_TIME'].to_i) {sleep 1 until RequestHelper.auth(school_password, pupil_pin).code == 200}
  response_pupil_auth = RequestHelper.auth(school_password, pupil_pin)
  @parsed_response_pupil_auth = JSON.parse(response_pupil_auth.body)
  @submission_hash = RequestHelper.build_check_submission_message(@parsed_response_pupil_auth, nil, nil, 'mouse', {practice: true})
  payload = @submission_hash[:submission_message]
  jwt =  @submission_hash[:payload][:tokens]['checkSubmission']["token"]
  RequestHelper.submit_check(jwt, payload)
  @school_uuid = @parsed_response_pupil_auth['school']['uuid']
  @check_code = @parsed_response_pupil_auth['checkCode']
  @received_check = SqlDbHelper.wait_for_received_check(@check_code)
  p @check_code
end


Then(/^I should see an error stating validation failed as the practice property is set to true$/) do
  wait_until{SqlDbHelper.wait_for_received_check(@check_code); !(SqlDbHelper.wait_for_received_check(@check_code)['processingFailed']).nil?}
  @received_check = SqlDbHelper.wait_for_received_check(@check_code)
  expect(@received_check['processingFailed']).to eql true
end

Given(/^a pupil has completed the check with the pupil property not being an object$/) do
  step 'I have generated a live pin for a pupil'
  pupil_detail = SqlDbHelper.pupil_details(@details_hash[:upn], @school_id)
  @pupil_id = pupil_detail['id']
  check_entry = SqlDbHelper.check_details(@pupil_id)
  pupil_pin_detail = SqlDbHelper.get_pupil_pin(check_entry['id'])
  pupil_pin = pupil_pin_detail['val']
  school_password = SqlDbHelper.find_school(pupil_detail['school_id'])['pin']
  Timeout.timeout(ENV['WAIT_TIME'].to_i) {sleep 1 until RequestHelper.auth(school_password, pupil_pin).code == 200}
  response_pupil_auth = RequestHelper.auth(school_password, pupil_pin)
  @parsed_response_pupil_auth = JSON.parse(response_pupil_auth.body)
  @submission_hash = RequestHelper.build_check_submission_message(@parsed_response_pupil_auth, nil, nil, 'mouse', {pupil_not_object: true})
  payload = @submission_hash[:submission_message]
  jwt =  @submission_hash[:payload][:tokens]['checkSubmission']["token"]
  RequestHelper.submit_check(jwt, payload)
  @school_uuid = @parsed_response_pupil_auth['school']['uuid']
  @check_code = @parsed_response_pupil_auth['checkCode']
  @received_check = SqlDbHelper.wait_for_received_check(@check_code)
  p @check_code
end


Then(/^I should see an error stating validation failed as the pupil property is not a object$/) do
  wait_until{SqlDbHelper.wait_for_received_check(@check_code); !(SqlDbHelper.wait_for_received_check(@check_code)['processingFailed']).nil?}
  @received_check = SqlDbHelper.wait_for_received_check(@check_code)
  expect(@received_check['processingFailed']).to eql true
end

Given(/^a pupil has completed the check with the questions are not contained in an array$/) do
  step 'I have generated a live pin for a pupil'
  pupil_detail = SqlDbHelper.pupil_details(@details_hash[:upn], @school_id)
  @pupil_id = pupil_detail['id']
  check_entry = SqlDbHelper.check_details(@pupil_id)
  pupil_pin_detail = SqlDbHelper.get_pupil_pin(check_entry['id'])
  pupil_pin = pupil_pin_detail['val']
  school_password = SqlDbHelper.find_school(pupil_detail['school_id'])['pin']
  Timeout.timeout(ENV['WAIT_TIME'].to_i) {sleep 1 until RequestHelper.auth(school_password, pupil_pin).code == 200}
  response_pupil_auth = RequestHelper.auth(school_password, pupil_pin)
  @parsed_response_pupil_auth = JSON.parse(response_pupil_auth.body)
  @submission_hash = RequestHelper.build_check_submission_message(@parsed_response_pupil_auth, nil, nil, 'mouse', {questions_not_array: true})
  payload = @submission_hash[:submission_message]
  jwt =  @submission_hash[:payload][:tokens]['checkSubmission']["token"]
  RequestHelper.submit_check(jwt, payload)
  @school_uuid = @parsed_response_pupil_auth['school']['uuid']
  @check_code = @parsed_response_pupil_auth['checkCode']
  @received_check = SqlDbHelper.wait_for_received_check(@check_code)
  p @check_code
end

Then(/^I should see an error stating validation failed as the questions are not an array$/) do
  wait_until{SqlDbHelper.wait_for_received_check(@check_code); !(SqlDbHelper.wait_for_received_check(@check_code)['processingFailed']).nil?}
  @received_check = SqlDbHelper.wait_for_received_check(@check_code)
  expect(@received_check['processingFailed']).to eql true
end

Given(/^a pupil has completed the check with the school property not being an object$/) do
  step 'I have generated a live pin for a pupil'
  pupil_detail = SqlDbHelper.pupil_details(@details_hash[:upn], @school_id)
  @pupil_id = pupil_detail['id']
  check_entry = SqlDbHelper.check_details(@pupil_id)
  pupil_pin_detail = SqlDbHelper.get_pupil_pin(check_entry['id'])
  pupil_pin = pupil_pin_detail['val']
  school_password = SqlDbHelper.find_school(pupil_detail['school_id'])['pin']
  Timeout.timeout(ENV['WAIT_TIME'].to_i) {sleep 1 until RequestHelper.auth(school_password, pupil_pin).code == 200}
  response_pupil_auth = RequestHelper.auth(school_password, pupil_pin)
  @parsed_response_pupil_auth = JSON.parse(response_pupil_auth.body)
  @submission_hash = RequestHelper.build_check_submission_message(@parsed_response_pupil_auth, nil, nil, 'mouse', {school_not_object: true})
  @school_uuid = @parsed_response_pupil_auth['school']['uuid']
  payload = @submission_hash[:submission_message]
  jwt =  @submission_hash[:payload][:tokens]['checkSubmission']["token"]
  RequestHelper.submit_check(jwt, payload)
  @check_code = @parsed_response_pupil_auth['checkCode']
  @received_check = SqlDbHelper.wait_for_received_check(@check_code)
  p @check_code
end

Then(/^I should see an error stating validation failed as the school property is not a object$/) do
  wait_until{SqlDbHelper.wait_for_received_check(@check_code); !(SqlDbHelper.wait_for_received_check(@check_code)['processingFailed']).nil?}
  @received_check = SqlDbHelper.wait_for_received_check(@check_code)
  expect(@received_check['processingFailed']).to eql true
end

Given(/^a pupil has completed the check with the tokens property not being an object$/) do
  step 'I have generated a live pin for a pupil'
  pupil_detail = SqlDbHelper.pupil_details(@details_hash[:upn], @school_id)
  @pupil_id = pupil_detail['id']
  check_entry = SqlDbHelper.check_details(@pupil_id)
  pupil_pin_detail = SqlDbHelper.get_pupil_pin(check_entry['id'])
  pupil_pin = pupil_pin_detail['val']
  school_password = SqlDbHelper.find_school(pupil_detail['school_id'])['pin']
  Timeout.timeout(ENV['WAIT_TIME'].to_i) {sleep 1 until RequestHelper.auth(school_password, pupil_pin).code == 200}
  response_pupil_auth = RequestHelper.auth(school_password, pupil_pin)
  @parsed_response_pupil_auth = JSON.parse(response_pupil_auth.body)
  @submission_hash = RequestHelper.build_check_submission_message(@parsed_response_pupil_auth, nil, nil, 'mouse', {tokens_not_object: true})
  payload = @submission_hash[:submission_message]
  jwt =   @parsed_response_pupil_auth["tokens"]['checkSubmission']['token']
  RequestHelper.submit_check(jwt, payload)
  @school_uuid = @parsed_response_pupil_auth['school']['uuid']
  @check_code = @parsed_response_pupil_auth['checkCode']
  @received_check = SqlDbHelper.wait_for_received_check(@check_code)
  p @check_code
end

Then(/^I should see an error stating validation failed as the tokens property is not a object$/) do
  wait_until{SqlDbHelper.wait_for_received_check(@check_code); !(SqlDbHelper.wait_for_received_check(@check_code)['processingFailed']).nil?}
  @received_check = SqlDbHelper.wait_for_received_check(@check_code)
  expect(@received_check['processingFailed']).to eql true
end

Then(/^I should see the check is recieved and is set to version (\d+)$/) do |version|
  @received_check = AzureTableHelper.wait_for_received_check( @school['urlSlug'], @check_code)
  expect(@received_check['checkVersion']).to eql version
end

Given(/^I have a payload$/) do
  step 'I have generated a live pin for a pupil'
  pupil_detail = SqlDbHelper.pupil_details(@details_hash[:upn], @school_id)
  @pupil_id = pupil_detail['id']
  check_entry = SqlDbHelper.check_details(@pupil_id)
  pupil_pin_detail = SqlDbHelper.get_pupil_pin(check_entry['id'])
  pupil_pin = pupil_pin_detail['val']
  school_password = SqlDbHelper.find_school(pupil_detail['school_id'])['pin']
  Timeout.timeout(ENV['WAIT_TIME'].to_i) {sleep 1 until RequestHelper.auth(school_password, pupil_pin).code == 200}
  response_pupil_auth = RequestHelper.auth(school_password, pupil_pin)
  @parsed_response_pupil_auth = JSON.parse(response_pupil_auth.body)
  @submission_hash = RequestHelper.build_check_submission_message(@parsed_response_pupil_auth, nil, nil, 'mouse', {decreased_answers_set: true})
  @payload = @submission_hash[:submission_message]
end

Given(/^I submit a check submission message under 24KB$/) do
  step 'I have a payload'
  under_limit_message = {payload: "11" * 127992}
  expect(under_limit_message.to_json.bytesize).to be < 256000
  expect(under_limit_message.to_json.bytesize).to be > 255000
  jwt =  @submission_hash[:payload][:tokens]['checkSubmission']["token"]
  @response = RequestHelper.submit_check(jwt, under_limit_message)
end

Then(/^I should get a (\d+) response$/) do |code|
  expect(@response.code).to eql code
end

Given(/^I submit a check submission message over 24KB$/) do
  step 'I have a payload'
  over_limit_message = {payload: "11" * 131999}
  expect(over_limit_message.to_json.bytesize).to be > 256000
  jwt =  @submission_hash[:payload][:tokens]['checkSubmission']["token"]
  @response = RequestHelper.submit_check(jwt, over_limit_message)
end
