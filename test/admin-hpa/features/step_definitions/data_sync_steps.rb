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
  db_answers = SqlDbHelper.get_answers(check_result_id).each {|x| x.delete ('id')}.each {|x|
    x.delete('createdAt')}.each {|x| x.delete ('updatedAt')}.each {|x|
    x.delete ('version')}.each {|x| x.delete ('checkResult_id')
  }
  db_answers.each {|a| a['browserTimestamp'] = a['browserTimestamp'].strftime("%Y-%m-%dT%H:%M:%S.%LZ")}
  answer_payload = @submission_hash[:payload][:answers].map {|a|
    {
      'questionNumber' => a[:sequenceNumber],
      'answer' => a[:answer].to_s,
      'question_id' => SqlDbHelper.get_question_id(a[:question].split('x')[0], a[:question].split('x')[1], false)['id'],
      'isCorrect' => (a[:question].split('x')[0].to_i * a[:question].split('x')[1].to_i == a[:answer]),
      'browserTimestamp' => (a[:clientTimestamp])
    }
  }
  expect(db_answers).to eql answer_payload
end

Given(/^my check has been marked with (.+) correct answers$/) do |mark|
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
  @submission_hash = RequestHelper.build_check_submission_message(@parsed_response_pupil_auth, mark, nil)
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

  payload_event_types = @submission_hash[:payload][:audit].map {|event|
    {'browserTimestamp' => event[:clientTimestamp],
     'eventType' => event[:type],
     'eventData' => (event[:data].nil? ? nil : {'sequenceNumber' => event[:data][:sequenceNumber],
                                                'question' => event[:data][:question],
                                                'isWarmup' => event[:data][:isWarmup]}),
     'question_id' => (event[:data].nil? ? nil : (event[:data][:isWarmup] == true) ? nil : SqlDbHelper.get_question_id(event[:data][:question].split('x')[0],
                                                                                                                       event[:data][:question].split('x')[1],
                                                                                                                       event[:data][:isWarmup])['id']),
     'questionNumber' => (event[:data].nil? ? nil : (event[:data][:isWarmup] == true) ? nil : event[:data][:sequenceNumber])}}

  db_event_types = SqlDbHelper.get_event_types_for_check(check_result_id).map {|event|
    {'browserTimestamp' => event['browserTimestamp'].strftime("%Y-%m-%dT%H:%M:%S.%LZ"),
     'eventType' => event['eventType'],
     'eventData' => (event['eventData'].nil? ? nil : (JSON.parse(event['eventData']))),
     'question_id' => (event['eventData'].nil? || event['eventData'].include?('true') ? nil : SqlDbHelper.get_question_id((
                                                                                                                          JSON.parse(event['eventData'])['question']).split('x')[0],
                                                                                                                          (JSON.parse(event['eventData'])['question']).split('x')[1],
                                                                                                                          (JSON.parse(event['eventData'])['isWarmup']))['id']),
     'questionNumber' => (event['eventData'].nil? || event['eventData'].include?('true') ? nil : (JSON.parse(event['eventData'])['sequenceNumber']))}}
  expect(payload_event_types).to eql db_event_types
end


Given(/^my check has been completed using a (.+)$/) do |input_type|
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
  @submission_hash = RequestHelper.build_check_submission_message(@parsed_response_pupil_auth, nil, nil, input_type)
  AzureQueueHelper.create_check_submission_message(@submission_hash[:submission_message].to_json)
  school_uuid = @parsed_response_pupil_auth['school']['uuid']
  @check_code = @parsed_response_pupil_auth['checkCode']
  AzureTableHelper.wait_for_received_check(school_uuid, @check_code)
end


Then(/^the inputs should be synced to the DB correctly$/) do
  check_id = SqlDbHelper.get_check_id(@check_code)
  SqlDbHelper.wait_for_check_result(check_id)
  check_result_id = SqlDbHelper.get_check_result_id(check_id)
  db_inputs = SqlDbHelper.get_input_data(check_result_id)
  db_inputs_hash = db_inputs.map {|input| {input: input['userInput'],
                                           eventType: input['name'].downcase,
                                           clientTimestamp: input['inputBrowserTimestamp'].strftime("%Y-%m-%dT%H:%M:%S.%LZ"),
                                           question: input['question'],
                                           sequenceNumber: input['questionNumber']}}
  expect(@submission_hash[:payload][:inputs]).to eql db_inputs_hash
  p @submission_hash[:payload][:inputs]
  p db_inputs_hash
end
