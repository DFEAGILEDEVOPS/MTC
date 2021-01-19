Given(/^I have completed the check with only (\d+) correct answers$/) do |correct_answers|
  step 'I have started the check'
  @mark = correct_answers
  @storage_school = JSON.parse page.evaluate_script('window.localStorage.getItem("school");')
  @storage_pupil = JSON.parse page.evaluate_script('window.localStorage.getItem("pupil");')
  questions = JSON.parse page.evaluate_script('window.localStorage.getItem("questions");')
  wrong_answers = questions.size - @mark
  @answers = check_page.complete_check_with_wrong_answers(wrong_answers, 'keyboard')
  @answers = check_page.complete_check_with_correct_answers(@mark, 'keyboard')
  complete_page.wait_for_complete_page
  expect(complete_page).to have_heading
end


Then(/^all answers events and inputs match$/) do
  check_result = AzureTableHelper.wait_for_received_check(@storage_school['uuid'], @storage_pupil['checkCode'])
  @archive = JSON.parse(LZString::UTF16.decompress(check_result['archive']))
  check_id = SqlDbHelper.get_check_id(@storage_pupil['checkCode'])
  SqlDbHelper.wait_for_check_result(check_id)
  check_result_id = SqlDbHelper.get_check_result_id(check_id)
  db_answers = SqlDbHelper.get_answers(check_result_id).each {|x| x.delete ('id')}.each {|x|
    x.delete('createdAt')}.each {|x| x.delete ('updatedAt')}.each {|x|
    x.delete ('version')}.each {|x| x.delete ('checkResult_id')
  }
  db_answers.each {|a| a['browserTimestamp'] = a['browserTimestamp'].strftime("%Y-%m-%dT%H:%M:%S.%LZ")}
  answer_payload = @archive['answers'].map {|a|
    {
      'questionNumber' => a['sequenceNumber'],
      'answer' => a['answer'].to_s,
      'question_id' => SqlDbHelper.get_question_id(a['question'].split('x')[0], a['question'].split('x')[1], false)['id'],
      'isCorrect' => (a['question'].split('x')[0].to_i * a['question'].split('x')[1].to_i) == a['answer'].to_i,
      'browserTimestamp' => (a['clientTimestamp'])
    }
  }
  expect(db_answers).to eql answer_payload
  event_type_payload = @archive['audit'].map {|event|
    {'browserTimestamp' => event['clientTimestamp'],
     'eventType' => event['type'],
     'eventData' => (event['data'].nil? ? nil : {'sequenceNumber' => event['data']['sequenceNumber'],
                                                'question' => event['data']['question'],
                                                'isWarmup' => event['data']['isWarmup']}),
     'question_id' => (event['data'].nil? ? nil : (event['data']['isWarmup'] == true) ? nil : SqlDbHelper.get_question_id(event['data']['question'].split('x')[0],
                                                                                                                       event['data']['question'].split('x')[1],
                                                                                                                       event['data']['isWarmup'])['id']),
     'questionNumber' => (event['data'].nil? ? nil : (event['data']['isWarmup'] == true) ? nil : event['data']['sequenceNumber'])}}

  db_event_types = SqlDbHelper.get_event_types_for_check(check_result_id).map {|event|
    {'browserTimestamp' => event['browserTimestamp'].strftime("%Y-%m-%dT%H:%M:%S.%LZ"),
     'eventType' => event['eventType'],
     'eventData' => (event['eventData'].nil? ? nil : (JSON.parse(event['eventData']))),
     'question_id' => (event['eventData'].nil? || event['eventData'].include?('true') ? nil : SqlDbHelper.get_question_id((
                                                                                                                          JSON.parse(event['eventData'])['question']).split('x')[0],
                                                                                                                          (JSON.parse(event['eventData'])['question']).split('x')[1],
                                                                                                                          (JSON.parse(event['eventData'])['isWarmup']))['id']),
     'questionNumber' => (event['eventData'].nil? || event['eventData'].include?('true') ? nil : (JSON.parse(event['eventData'])['sequenceNumber']))}}
  expect(event_type_payload.sort_by{|h| [h['browserTimestamp'], h['eventType']]}).to eql db_event_types.sort_by{|h| [h['browserTimestamp'], h['eventType']]}
  db_inputs = SqlDbHelper.get_input_data(check_result_id)
  db_inputs_hash = db_inputs.map {|input| {input: input['userInput'],
                                           eventType: input['name'].downcase,
                                           clientTimestamp: input['inputBrowserTimestamp'].strftime("%Y-%m-%dT%H:%M:%S.%LZ"),
                                           question: input['question'],
                                           sequenceNumber: input['questionNumber']}}
  expect(@archive['inputs'].map {|hash| hash.transform_keys{ |key| key.to_sym }}).to eql db_inputs_hash
  check_result = SqlDbHelper.get_check_result(check_id)
  expect(check_result['mark']).to eql @mark.to_i
end
