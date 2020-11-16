Given(/^my check has been marked$/) do
  step 'I have generated a live pin for a pupil'
  step 'pupil logs in and completed the check'
end

When(/^the data sync function has run$/) do
  response = FunctionsHelper.trigger_func('sync-results-to-sql')
  expect(response.code).to eql 202
end

Then(/^the answers should be synced to the DB correctly$/) do
  check_id = SqlDbHelper.get_check_id(@check_code)
  SqlDbHelper.wait_for_check_result(check_id)
  check_result_id = SqlDbHelper.get_check_result_id(check_id)
  answers = SqlDbHelper.get_answers(check_result_id)
  expect(answers.map{|answer| {answer['questionNumber'] => answer['answer']}}).to eql @submission_hash[:payload][:answers].map {|answer| {answer[:sequenceNumber] => answer[:answer]}}
end

Given(/^I my check has been marked with (.+) correct answers$/) do |mark|
  @mark = mark
  step 'I have generated a live pin for a pupil'
  pupil_detail = SqlDbHelper.pupil_details(@details_hash[:upn])
  @pupil_id = pupil_detail['id']
  check_entry = SqlDbHelper.check_details(@pupil_id)
  pupil_pin_detail = SqlDbHelper.get_pupil_pin(check_entry['id'])
  pupil_pin = pupil_pin_detail['val']
  school_password = SqlDbHelper.find_school(pupil_detail['school_id'])['pin']
  Timeout.timeout(ENV['WAIT_TIME'].to_i) {sleep 1 until RequestHelper.auth(school_password, pupil_pin).code == 200}
  response_pupil_auth = RequestHelper.auth(school_password, pupil_pin)
  @parsed_response_pupil_auth = JSON.parse(response_pupil_auth.body)
  @submission_hash = RequestHelper.build_check_submission_message(@parsed_response_pupil_auth,mark, nil)
  AzureQueueHelper.create_check_submission_message(@submission_hash[:submission_message].to_json)
  school_uuid = @parsed_response_pupil_auth['school']['uuid']
  @check_code = @parsed_response_pupil_auth['checkCode']
  AzureTableHelper.wait_for_received_check(school_uuid, @check_code)
end

Then(/^the correct mark should be synced to the DB correctly$/) do
  check_id = SqlDbHelper.get_check_id(@check_code)
  SqlDbHelper.wait_for_check_result(check_id)
  check_result = SqlDbHelper.get_check_result(check_id)
  expect(check_result['mark']).to eql @mark.to_i
end

Then(/^the events should be synced to the DB correctly$/) do
  check_id = SqlDbHelper.get_check_id(@check_code)
  SqlDbHelper.wait_for_check_result(check_id)
  check_result_id = SqlDbHelper.get_check_result_id(check_id)
  db_event_types = SqlDbHelper.get_event_types_for_check(check_result_id).map{|row| row['eventType']}
  payload_event_types =  @submission_hash[:payload][:audit].map{|event| event[:type]}
  expect(payload_event_types).to eql db_event_types
end
