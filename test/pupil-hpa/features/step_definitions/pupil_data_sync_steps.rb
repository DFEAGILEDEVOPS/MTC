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
  @check_code = @storage_pupil['checkCode']
  p @check_code
end


Then(/^all answers events and inputs match$/) do
  check_result = SqlDbHelper.wait_for_received_check(@storage_pupil['checkCode'])
  @archive = JSON.parse(LZString::UTF16.decompress(check_result['archive']))
  check_id = SqlDbHelper.get_check_id(@storage_pupil['checkCode'])
  SqlDbHelper.wait_for_check_result_row(check_id)
  check_result_id = SqlDbHelper.get_check_result_id(check_id)
  db_answers = SqlDbHelper.get_answers(check_result_id).each {|x| x.delete ('id')}.each {|x|
    x.delete('createdAt')}.each {|x| x.delete ('updatedAt')}.each {|x|
    x.delete ('version')}.each {|x| x.delete ('checkResult_id')
  }
  db_answers.each {|a| a['browserTimestamp'] = a['browserTimestamp'].utc.strftime("%Y-%m-%dT%H:%M:%S.%LZ")}
  answer_payload = @archive['answers'].map {|a|
    {
      'questionNumber' => a['sequenceNumber'],
      'answer' => a['answer'].to_s,
      'question_id' => SqlDbHelper.get_question_id(a['question'].split('x')[0], a['question'].split('x')[1], false)['id'],
      'isCorrect' => (a['question'].split('x')[0].to_i * a['question'].split('x')[1].to_i) == a['answer'].to_i,
      'browserTimestamp' => (a['clientTimestamp']),
    }
  }
  expect(db_answers).to eql answer_payload
  event_type_payload = @archive['audit'].map {|event|
    {'browserTimestamp' => event['clientTimestamp'],
     'eventType' => event['type'],
     'eventData' => (event['data']['sequenceNumber'].nil? ? {'monotonicTime' => event['data']['monotonicTime']} : {
       'sequenceNumber' => event['data']['sequenceNumber'],
       'question' => event['data']['question'],
       'isWarmup' => event['data']['isWarmup'],
     'monotonicTime' => event['data']['monotonicTime']}),
     'question_id' => (event['data']['sequenceNumber'].nil? ? nil : (event['data']['isWarmup'] == true) ? nil : SqlDbHelper.get_question_id(event['data']['question'].split('x')[0], event['data']['question'].split('x')[1], event['data']['isWarmup'])['id']),
     'questionNumber' => (event['data']['sequenceNumber'].nil? ? nil : (event['data']['isWarmup'] == true) ? nil : event['data']['sequenceNumber'])}}

  db_event_types = SqlDbHelper.get_event_types_for_check(check_result_id).map {|event|
    {'browserTimestamp' => event['browserTimestamp'].utc.strftime("%Y-%m-%dT%H:%M:%S.%LZ"),
     'eventType' => event['eventType'],
     'eventData' => (event['eventData'].nil? ? nil : (JSON.parse(event['eventData']))),
     'question_id' => event['question_id'],
     'questionNumber' => event['questionNumber']}}
  expect(event_type_payload.sort_by {|h| [h['browserTimestamp'], h['eventType']]}).to eql db_event_types.sort_by {|h| [h['browserTimestamp'], h['eventType']]}
  db_inputs = SqlDbHelper.get_input_data(check_result_id)
  db_inputs_hash = db_inputs.map {|input| {input: input['userInput'],
                                           eventType: input['name'].downcase,
                                           clientTimestamp: input['inputBrowserTimestamp'].utc.strftime("%Y-%m-%dT%H:%M:%S.%LZ"),
                                           question: input['question'],
                                           sequenceNumber: input['questionNumber']}}
  @archive['inputs'].delete('monotonicTime')
  expect(@archive['inputs'].map {|hash| hash.delete('monotonicTime'); hash.transform_keys {|key| key.to_sym}}).to eql db_inputs_hash
  check_result = SqlDbHelper.get_check_result(check_id)
  expect(check_result['mark']).to eql @mark.to_i
end

Given(/^I have completed a check by selecting all keys on the keyboard$/) do
  step 'I have started the check'
  @numbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']
  @alphabet = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z']
  @keys = [:cancel, :help, :backspace, :tab, :clear, :shift, :control, :alt, :pause, :escape, :space, :page_up, :page_down, :end, :home]
  @keys_2 = [:left, :up, :right, :down, :insert, :delete, :semicolon, :multiply, :add, :separator, :subtract, :decimal, :divide, :equals]
  @special = ['!', '@', '$', '%', '^', '&', '*', '(', ')', '_', '+', '}', '{', '|', '"', ':', '?', '>', '<', '~', ',']
  @f_keys = [:f1, :f2, :f3, :f4, :f5, :f6, :f7, :f8, :f9, :f10, :f11, :f12]
  @enter = [:enter]
  find('.numpad-container #kb1').send_keys(@numbers)
  find('.numpad-container #kb1').send_keys(@alphabet)
  find('.numpad-container #kb1').send_keys(@keys)
  find('.numpad-container #kb1').send_keys(@special)
  find('.numpad-container #kb1').send_keys(@keys_2)
  find('.numpad-container #kb1').send_keys(@keys_3)
  find('.numpad-container #kb1').send_keys(@f_keys)
  find('.numpad-container #kb1').send_keys(@enter)
  check_page.complete_check_with_correct_answers(24, 'keyboard')
end

Then(/^I should see all inputs recorded$/) do
  @storage_school = JSON.parse page.evaluate_script('window.localStorage.getItem("school");')
  @storage_pupil = JSON.parse page.evaluate_script('window.localStorage.getItem("pupil");')
  SqlDbHelper.wait_for_received_check(@storage_pupil['checkCode'])
  check_id = SqlDbHelper.get_check_id(@storage_pupil['checkCode'])
  SqlDbHelper.wait_for_check_result_row(check_id)
  check_result_id = SqlDbHelper.get_check_result_id(check_id)
  db_inputs = SqlDbHelper.get_input_data(check_result_id).map {|h| h['userInput'].downcase if h['questionNumber'] == 1}.compact
  array_of_inputs = @numbers + @alphabet + @keys.map {|k| k.to_s} + @keys_2.map {|k| k.to_s} + @special + @f_keys.map {|k| k.to_s} + @enter.map {|k| k.to_s}
  mapped_array = array_of_inputs.map {|k| k.gsub('page_', 'page').gsub(/\Aspace/, ' ').gsub('equals', '=').gsub(/\Aleft/, 'arrowleft').gsub(/\Adown/, 'arrowdown').gsub(/\Aup/, 'arrowup').gsub(/\Aright/, 'arrowright').gsub('semicolon', ';').gsub('multiply', '*').gsub('add', '+').gsub('separator', '|').gsub('subtract', '-').gsub('decimal', '.').gsub('divide', '/')}
  db_inputs.each {|k| expect(mapped_array).to include k}
end
