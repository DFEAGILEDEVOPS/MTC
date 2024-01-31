Given(/^I have started the check(?: using the (.+))?$/) do |input|
  input_type = (input ? input : 'numpad')
  step 'I have generated a live pin'
  step 'I have logged in'
  confirmation_page.read_instructions.click
  start_page.start_warm_up.click
  warm_up_page.start_now.click
  step "I complete the warm up questions using the #{input_type}"
  warm_up_complete_page.start_check.click
  start_mtc
end

Given(/^I complete the warm up questions using the (.+)$/) do |input_type|
  @warm_up_inputs = warm_up_page.complete_check_with_correct_answers(3, input_type)
end

Then(/^the loading page should display for the configured number of seconds$/) do
  check_page.wait_for_preload_to_expire(2)
  expect(check_page).to have_question
end

When(/^the loading screen has expired$/) do
  check_page.wait_for_preload_to_expire(2)
end

Then(/^I should see a question$/) do
  expect(check_page).to have_question
end

Then(/^the question should display for the configured number of seconds$/) do
  @question = check_page.question.text
  check_page.wait_for_question_timer_to_expire(5)
  expect(check_page).to have_preload
end

Then(/^I could not answer the question within the configured number of seconds$/) do
  step 'the loading screen has expired'
  @question = check_page.question.text
  check_page.wait_for_question_timer_to_expire(5)
  expect(check_page).to have_preload
end

Then(/^I should be able to see the input answer box and no number pad$/) do
  check_page.wait_for_question
  expect(check_page).to have_answer
  expect(check_page).to have_no_number_pad
end

Then(/^I should be moved to the next question$/) do
  check_page.wait_for_question
  expect(check_page.question.text).to_not eql @question
end

Then(/^the route remains the same$/) do
  expected_url = Capybara.app_host + '/check'
  expect(current_url).to eql expected_url
  check_page.wait_for_preload_to_expire(2)
  check_page.wait_for_question
  expect(current_url).to eql expected_url
end

Then(/^I should see the on screen keyboard$/) do
  check_page.wait_for_question
  expect(check_page).to have_number_pad
end

Then(/^I can answer the question using the on screen keyboard$/) do
  check_page.wait_for_preload
  check_page.wait_for_question
  @question = check_page.question.text
  values = @question.gsub('=', '').split('×').map {|n| n.strip}
  check_page.enter_answer_via_numpad(values.first.to_i * values.last.to_i)
  check_page.number_pad.enter.click
  check_page.wait_for_question
  expect(check_page.question.text).to_not eql @question
end

Then(/^I can answer the question using their physical keyboard$/) do
  check_page.wait_until_question_visible
  @question = check_page.question.text
  values = @question.gsub('=', '').split('×').map {|n| n.strip}
  check_page.enter_answer_via_keyboard(values.first.to_i * values.last.to_i)
  check_page.number_pad.one.send_keys(:enter)
  check_page.wait_for_question
  expect(check_page.question.text).to_not eql @question
end

Then(/^I should be able to use the on screen (.+) to complete the test$/) do |input|
  questions = JSON.parse page.evaluate_script('window.localStorage.getItem("questions");')
  storage_pupil = JSON.parse page.evaluate_script('window.localStorage.getItem("pupil");')
  @answers = check_page.complete_check_with_correct_answers(questions.size,input)
  complete_page.wait_for_complete_page
  expect(complete_page).to have_heading
  @check_code = storage_pupil['checkCode']
  p @check_code
end

When(/^I have entered an incorrect answer$/) do
  check_page.wait_for_question
  check_page.enter_answer_via_numpad(20)
  @value = check_page.answer.text
end

When(/^I should be able to correct my answer if i am quick enough$/) do
  2.times {check_page.number_pad.backspace.click}
  question = check_page.question.text
  values = question.gsub('=', '').split('×').map {|n| n.strip}
  check_page.enter_answer_via_keyboard(values.first.to_i * values.last.to_i)
  expect(check_page.answer.text).to_not eql @value
end

Then(/^I should see a timer$/) do
  expect(check_page).to have_timer
end

Given(/^I am on the check loading page$/) do
  step 'I have started the check'
  wait_until {check_page.has_preload?}
end


Then(/^I should see the number of the next questions$/) do
  expect(check_page.preload.text).to eql "Question 1…"
end

Then(/^I should see all the data from the check stored in the DB$/) do
  storage1 = page.evaluate_script('window.localStorage;')
  storage_answers_keys= storage1.keys.select{|x| x.include?('answers')}

  storage_answers = []
  storage_answers_keys.each do |key|
    storage_answers << (JSON.parse page.evaluate_script("window.localStorage.getItem('#{key}');"))
  end

  storage_pupil = JSON.parse page.evaluate_script('window.localStorage.getItem("pupil");')
  storage_school = JSON.parse page.evaluate_script('window.localStorage.getItem("school");')
  storage_config = JSON.parse page.evaluate_script('window.localStorage.getItem("config");')

  storage_inputs_keys= storage1.keys.select{|x| x.include?('inputs')}
  storage_inputs = []
  storage_inputs_keys.each do |key|
    storage_inputs << (JSON.parse page.evaluate_script("window.localStorage.getItem('#{key}');"))
  end

  storage_audit_keys = storage1.keys.select{|x| x.include?('audit')}
  storage_audit = []
  storage_audit_keys.each do |key|
    storage_audit << (JSON.parse page.evaluate_script("window.localStorage.getItem('#{key}');"))
  end

  storage_questions = JSON.parse page.evaluate_script('window.localStorage.getItem("questions");')
  check_result = SqlDbHelper.wait_for_received_check(storage_pupil['checkCode'])
  storage_row = AzureTableHelper.get_row('receivedCheck', storage_school['uuid'], storage_pupil['checkCode'])
  check = JSON.parse(LZString::Base64.decompress(storage_row['archive']))
  storage_answers.each {|answer| expect(check['answers']).to include answer}
  storage_inputs.each {|input| expect(check['inputs']).to include input}
  [storage_school].each {|audit| expect(check['school']).to include audit}
  [storage_config].each {|audit| expect(check['config']).to include audit}
  storage_questions.each {|audit| expect(check['questions']).to include audit}
  [storage_pupil].each {|audit| expect(check['pupil']).to include audit}
  storage_audit.each do|audit|
    if !((audit['type'].eql?('CheckSubmissionAPICallSucceeded')) || (audit['type'].eql?('CheckSubmissionApiCalled')) || (audit['type'].eql?('CheckComplete')))
      expect(check['audit']).to include audit
    end
  end
end

Given(/^I am on the MTC check start page$/) do
  step 'I have generated a live pin'
  step 'I have logged in'
  confirmation_page.read_instructions.click
  start_page.start_warm_up.click
  warm_up_page.start_now.click
  step "I complete the warm up questions using the numpad"
  warm_up_complete_page.start_check.click
end

Then(/^I should see the number of questions$/) do
  questions = JSON.parse page.evaluate_script('window.localStorage.getItem("questions");')
  expect(mtc_check_start_page.questions.text).to include "There will be #{questions.size} questions."
end

Then(/^I should see the question and timer$/) do
  step 'I should see a question'
  step 'I should see a timer'
end


Given(/^I have just completed the check with only (\d+) correct answers$/) do |correct_answers|
  step 'I have started the check'
  questions = JSON.parse page.evaluate_script('window.localStorage.getItem("questions");')
  wrong_answers = questions.size - correct_answers
  @answers = check_page.complete_check_with_wrong_answers(wrong_answers,'keyboard')
  @answers = check_page.complete_check_with_correct_answers(correct_answers,'keyboard')
  complete_page.wait_for_complete_page
  expect(complete_page).to have_heading
end


Then(/^my score should be calculated as (\d+) and stored$/) do |expected_score|
  ls_pupil = JSON.parse page.evaluate_script('window.localStorage.getItem("pupil");')
  check_code = ls_pupil['checkCode']
  check_result = AzureTableHelper.get_check_result(check_code)
  time = Time.now
  expect((time - Time.parse(check_result.properties['markedAt']))/60).to be <= 1
  expect(check_result.properties['mark']).to eql expected_score
  expect(check_result.properties['maxMarks']).to eql 25
  correct_answers = JSON.parse(check_result.properties['markedAnswers']).select {|x| x['isCorrect'] == true}
  incorrect_answers = JSON.parse(check_result.properties['markedAnswers']).select {|x| x['isCorrect'] == false}
  expect(correct_answers.count).to eql expected_score
  expect(incorrect_answers.count).to eql (25 -expected_score)
end

When(/^I decode the JWT token$/) do
  received_check = AzureTableHelper.wait_for_received_check(@school['entity']['urlSlug'], @check_code)
  jwt_token = JSON.parse(LZString::Base64.decompress(received_check['archive']))['tokens']['checkSubmission']['token']
  @decoded_jwt = decode_jwt_token(jwt_token)
end

Then(/^it should contain the correct information$/) do
  expect(@decoded_jwt.first['checkCode']).to eql @check_code
  expect(@decoded_jwt.first['iss']).to eql 'MTC Admin'
  expect(@decoded_jwt.first['sub']).to eql SqlDbHelper.pupil_details(@details_hash[:upn])['urlSlug']
end
