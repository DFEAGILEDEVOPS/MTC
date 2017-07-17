Given(/^I am on the sign in page$/) do
  sign_in_page.load
end

Then(/^I should see a (.+) heading$/) do |page|
  expect(send(page.gsub(' ', '_'))).to have_heading
end

Then(/^I should see some (.+) intro text$/) do |page|
  expect(send(page.gsub(' ', '_'))).to have_welcome_message
end


Then(/^I should be able to view the demo$/) do
  expect(sign_in_page).to have_view_demo
end

When(/^I decide i want to start the demo$/) do
  sign_in_page.view_demo.click
end

Then(/^I should be taken to the start page$/) do
  expect(start_page).to be_displayed
end

Then(/^I should be able to start the check$/) do
  expect(start_page).to have_start_check
end

When(/^I start the check$/) do
  confirmation_page.read_instructions.click
  warm_up_page.load(url: 'complete')
  start_page.start_check.click
end


When(/^I start the warm up check$/) do
  warm_up_page.start_now.click
end


Then(/^I should have (\d+) seconds before i see the first question$/) do |wait_time|
  expect(check_page.preload.visible?).to be true
  check_page.wait_for_preload
  expect(check_page.preload.visible?).to be false
end

Given(/^I am on the check page$/) do
  step "I have logged in"
  check_page.load(number: 1)
end

Then(/^I should see a question$/) do
  check_page.wait_for_preload
  expect(check_page.question.visible?).to be true
end

Then(/^I should see a way to submit my answer$/) do
  check_page.wait_for_preload
  expect(check_page.number_pad.enter.visible?).to be true
end

Then(/^I should see that i have (\d+) seconds to answer the question$/) do |wait_time|
  check_page.wait_for_preload
  expect(check_page.timer.visible?).to be true
  check_page.wait_for_timer(wait_time)
  expect(check_page.timer.visible?).to be false
end

And(/^I could not answer the question within (\d+) seconds$/) do |wait_time|
  check_page.wait_for_preload
  @unanswered_question = check_page.question.text
end

Then(/^I should be moved to the next question after (\d+) seconds$/) do |wait_time|
  check_page.wait_for_timer(wait_time)
  check_page.wait_for_preload
  expect(check_page.question.text).to_not eql @unanswered_question
end

And(/^I could answer the (.+) question within (\d+) seconds$/) do |page, sec|
  page = send(page.gsub(' ', '_'))
  page.wait_for_preload
  page.wait_for_question(2)
  @question = page.question.text
  values = @question.gsub('=', '').split('×').map {|n| n.strip}
  answer = values.first.to_i * values.last.to_i
  page.enter_answer_via_keyboard(answer)
  page.number_pad.enter.click
end

Then(/^I should be moved to the next question$/) do
  # check_page.wait_for_preload
  expect(check_page.question.text).to_not eql @question
end

Given(/^I am on the complete page$/) do
  step "I have logged in"
  complete_page.load
end

Then(/^I should see some text stating i have completed the check$/) do
  expect(complete_page).to have_completion_text
end

Then(/^I should be able to sign out$/) do
  expect(complete_page).to have_sign_out
end

When(/^I choose to sign out$/) do
  complete_page.sign_out.click
end

Then(/^I should be taken back to the sign in page$/) do
  expect(sign_in_page).to be_displayed
end

Then(/^I should only be able to enter a number$/) do
  check_page.wait_for_preload
  check_page.answer.send_keys 'answer1'
  expect(check_page.answer.value).to eql '1'
end

Then(/^I should see the on screen keyboard$/) do
  check_page.wait_for_preload
  expect(check_page.number_pad).to be_all_there
end

Then(/^I can submit an answer using enter on my physical keyboard$/) do
  step "I can answer the question using the on screen keyboard"
  check_page.answer.send_keys :enter
end

And(/^I accidently touch some numbers on my keyboard during the preload$/) do
  check_page.answer.send_keys '98'
end

Then(/^I should not see any values in the answer field when the question has loaded$/) do
  expect(check_page.answer.value).to be_empty
end

Then(/^I can answer the question using the on screen keyboard$/) do
  check_page.wait_for_preload
  @question = check_page.question.text
  values = @question.gsub('=', '').split('×').map {|n| n.strip}
  check_page.enter_answer_via_keyboard(values.first.to_i * values.last.to_i)
end

Then(/^I should be able to use the on screen keyboard to complete the test$/) do
  @answers = check_page.complete_check_with_correct_answers(10)
  expect(complete_page).to be_displayed
end

Then(/^I should be able to use the on screen keyboard to complete the warm up questions$/) do
  check_page.complete_check_with_correct_answers(3)
  expect(warm_up_complete_page).to be_displayed
end

And(/^the warm up questions start and end dates are saved in database$/) do
  time_from_db = MongoDbHelper.warm_up_test_time(@pupil_information['pin'])
  expect(time_from_db).to be < 10
end

Then(/^I should see a STA logo$/) do
  expect(sign_in_page).to have_logo
  expect(sign_in_page.logo.text).to eql 'Standards & Testing Agency'
end

Then(/^I should be shown instructions on how the check works$/) do
  expect(start_page).to have_heading
  expect(start_page).to have_bulleted_list_instructions
end

Then(/^I should be shown the confirmation page displaying my name$/) do
  expect(confirmation_page).to have_heading(text: "Welcome, #{@pupil_information['foreName']}", match: :prefer_exact)
  expect(confirmation_page).to have_page_instructions
  expect(confirmation_page).to have_first_name(text: @pupil_information['foreName'], match: :prefer_exact)
  expect(confirmation_page).to have_last_name(text: @pupil_information['lastName'], match: :prefer_exact)
  expect(confirmation_page).to have_school_name(text: MongoDbHelper.find_school(@pupil_information['school'])['name'], match: :prefer_exact)
end

When(/^I click the link to read instructions$/) do
  confirmation_page.read_instructions.click
end

When(/^I click the link to enter my details again$/) do
  confirmation_page.back_sign_in_page.click
end

When(/^I choose to give feedback$/) do
  complete_page.feedback.click
end

Then(/^I should be taken to the feedback page$/) do
  expect(feedback_page).to be_displayed
end

Given(/^I am on the feedback page$/) do
  step "I have logged in"
  feedback_page.load
end

Then(/^I should be able to leave my contact details$/) do
  expect(feedback_page).to have_follow_up_title
  expect(feedback_page).to have_follow_up_text
  expect(feedback_page).to have_first_name_field
  expect(feedback_page).to have_last_name_field
  expect(feedback_page).to have_contact_number_field
  expect(feedback_page).to have_email_address_field
  expect(feedback_page).to have_school_name_field
  expect(feedback_page).to have_first_name_field
end

When(/^I have provided my feedback$/) do
  feedback_page.keyboard.click
  feedback_page.very_easy.click
  feedback_page.comments_field.set 'Test feedback'
end

Then(/^I should be able to submit my feedback$/) do
  feedback_page.submit.click
end

And(/^I should be shown the thanks page$/) do
  expect(feedback_thanks_page).to be_displayed
  expect(feedback_thanks_page).to have_feedback_thanks
  expect(feedback_thanks_page).to have_next_pupil
end

Then(/^I should see a requirement for first letter of pupil name$/) do
  expect(sign_in_page).to have_first_letter
end

Then(/^I should see a requirement for day and month of the pupil$/) do
  expect(sign_in_page).to have_day
  expect(sign_in_page).to have_month
end

Then(/^I should see a requirement for a activation pin$/) do
  expect(sign_in_page).to have_pin
end

Given(/^I have logged in$/) do
  sign_in_page.load
  MongoDbHelper.expire_pin("Automated","Account",9991999,false)
  MongoDbHelper.reset_pin("Automated","Account",9991999,"9999a")
  @pupil_information = MongoDbHelper.find_pupil_via_pin("9999a")
  sign_in_page.login("abc12345","9999a")
  sign_in_page.sign_in_button.click
end

Then(/^I should see a sign in button$/) do
  expect(sign_in_page).to have_sign_in_button
end

Then(/^I should see a requirement for a school pin$/) do
  expect(sign_in_page).to have_school_pin
end

Then(/^I should see a requirement for a pupil pin$/) do
  expect(sign_in_page).to have_pupil_pin
end

And(/^the answers should be stored$/) do
  session_id = URI.unescape(get_me_the_cookie('pupil-app.sid')[:value]).split(':')[1].split('.')[0]
  expect(MongoDbHelper.get_answers(session_id).last.map {|answer| answer['input']}).to eql @answers.map {|answer| answer.to_s}
end

And(/^the result should be stored$/) do
  session_id = URI.unescape(get_me_the_cookie('pupil-app.sid')[:value]).split(':')[1].split('.')[0]
  expect(MongoDbHelper.get_result(session_id)).to_not be_empty
end

When(/^I could not answer the question$/) do
  @answers = check_page.complete_check_with_correct_answers(9)
  check_page.wait_for_timer(5)
  expect(complete_page).to be_displayed
end

Then(/^the answer should be stored as empty$/) do
  session_id = URI.unescape(get_me_the_cookie('pupil-app.sid')[:value]).split(':')[1].split('.')[0]
  expect(MongoDbHelper.get_answers(session_id).last.map {|answer| answer['input']}).to include ""
end

Given(/^I did not answer enough questions correctly to pass$/) do
  step "I have logged in"
  check_page.load(number: 1)
  @answers = check_page.complete_check_with_correct_answers(5)
  @answers = check_page.complete_check_with_wrong_answers(5)
  expect(complete_page).to be_displayed
end

Then(/^the result should be stored as fail$/) do
  session_id = URI.unescape(get_me_the_cookie('pupil-app.sid')[:value]).split(':')[1].split('.')[0]
  expect(MongoDbHelper.get_result(session_id).first['correct']).to eql 5
  expect(MongoDbHelper.get_result(session_id).first['isPass']).to be false
end

Given(/^I did answer enough questions correctly to pass$/) do
  step "I have logged in"
  check_page.load(number: 1)
  @answers = check_page.complete_check_with_correct_answers(7)
  @answers = check_page.complete_check_with_wrong_answers(3)
  expect(complete_page).to be_displayed
end

Then(/^the result should be stored as pass$/) do
  session_id = URI.unescape(get_me_the_cookie('pupil-app.sid')[:value]).split(':')[1].split('.')[0]
  expect(MongoDbHelper.get_result(session_id).first['correct']).to eql 7
  expect(MongoDbHelper.get_result(session_id).first['isPass']).to be true
end


Then(/^I should see that the correct pin details are used for a given answer$/) do
  session_id = URI.unescape(get_me_the_cookie('pupil-app.sid')[:value]).split(':')[1].split('.')[0]
  event = MongoDbHelper.logon_event(session_id)
  expect(event['schoolPin']).to eql "abc12345"
  expect(event['pupilPin']).to eql @pupil_information['pin']
end


Then(/^I can see that the autocomplete is turned off$/) do
  expect(sign_in_page).to have_auto_complete_off
end

Given(/^I am on the warm up intro page$/) do
  step "I have logged in"
  step "I click the link to read instructions"
  warm_up_page.start_warm_up_questions.click
end


Given(/^I am on the warm up check page$/) do
  step "I am on the warm up intro page"
  warm_up_page.start_now.click
end

Given(/^I am on the warm up complete page$/) do
  step "I am on the warm up intro page"
  warm_up_complete_page.load
end

Then(/^I should see that we are in the (.+) development phase on the (.+) page$/) do |phase,page|
  expect(send("#{page}_page").phase_banner.phase.text).to eql phase.upcase
end

Then(/^I should see a feedback link on the (.+) page$/) do |page|
  expect(send("#{page}_page").phase_banner.feedback.text).to eql "This is a new service – your feedback will help us to improve it."
  expect(send("#{page}_page").phase_banner.feedback).to have_link
end

Then(/^I should be taken to the sign in failure page$/) do
  expect(sign_in_failure_page).to be_displayed
end

Then(/^my pin should be expired$/) do
  expect(MongoDbHelper.find_pupil_via_pin(@pupil_information['pin'])['pinExpired']).to be true
end

When(/^I attempt to login with just a pupil pin$/) do
  sign_in_page.load
  sign_in_page.login(nil,"9999a")
  sign_in_page.sign_in_button.click
end

When(/^I attempt to login with just a school pin for school (.*)$/) do |school|
  sign_in_page.load
  @pupil_information = MongoDbHelper.find_next_pupil
  @school_pin = MongoDbHelper.school_pin_retriever(school.to_i)
  sign_in_page.login(@school_pin)
  sign_in_page.sign_in_button.click
end

And(/^I cannot relogin$/) do
  sign_in_page.load
  sign_in_page.login(@school_pin, @pupil_information['pin'])
  sign_in_page.sign_in_button.click
  expect(sign_in_failure_page).to be_displayed
end

Given(/^I answered questions correctly but with leading zeros$/) do
  step "I have logged in"
  check_page.load(number: 1)
  @answers = check_page.complete_check_with_leading_zeros
end

And(/^the answers should be stored with leading zeros$/) do
  session_id = URI.unescape(get_me_the_cookie('pupil-app.sid')[:value]).split(':')[1].split('.')[0]
  array_of_answers = MongoDbHelper.get_answers(session_id)
  array_of_answers.map {|answer| answer.last['input']}
  expect(@answers.map {|answer| answer.to_s}).to eql array_of_answers.map {|answer| answer.last['input']}
end

Then(/^the results should be stored as pass$/) do
  session_id = URI.unescape(get_me_the_cookie('pupil-app.sid')[:value]).split(':')[1].split('.')[0]
  expect(MongoDbHelper.get_result(session_id).first['correct']).to eql 10
  expect(MongoDbHelper.get_result(session_id).first['isPass']).to be true
end


Then(/^I should be able to provide my method of entry$/) do
  expect(feedback_page).to have_touchscreen
  expect(feedback_page).to have_mouse
  expect(feedback_page).to have_keyboard
  expect(feedback_page).to have_mix
end

Then(/^I should be able to give feedback on how difficult it was to enter answers$/) do
  expect(feedback_page).to have_very_easy
  expect(feedback_page).to have_easy
  expect(feedback_page).to have_neither
  expect(feedback_page).to have_difficult
  expect(feedback_page).to have_very_difficult
end


Given(/^I have completed the check$/) do
  step "I have logged in"
  confirmation_page.read_instructions.click
  warm_up_page.start_warm_up_questions.click
  warm_up_page.start_now.click
  check_page.complete_check_with_correct_answers(3)
  warm_up_complete_page.start_check.click
  @start_time = Time.now
  check_page.complete_check_with_correct_answers(10)
  @finish_time = Time.now
end

Then(/^the time i started and finished should be recorded$/) do
  actual = MongoDbHelper.find_pupil_via_pin(@pupil_information['pin'])['checkStartDate'].to_i
  expect(actual/1000).to eql @start_time.utc.to_i/1000
  actual = MongoDbHelper.find_pupil_via_pin(@pupil_information['pin'])['checkEndDate'].to_i
  expect(actual/1000).to eql @finish_time.utc.to_i/1000
end