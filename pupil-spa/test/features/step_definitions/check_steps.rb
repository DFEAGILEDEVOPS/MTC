Given(/^I have started the check(?: using the (.+))?$/) do |input|
  input_type = (input ? input : 'numpad')
  step 'I have logged in'
  confirmation_page.read_instructions.click
  start_page.start_warm_up.click
  warm_up_page.start_now.click
  step "I complete the warm up questions using the #{input_type}"
  warm_up_complete_page.start_check.click
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
  check_page.wait_for_question_timer_to_expire(5)
  expect(check_page).to have_preload
end

Then(/^I could not answer the question within the configured number of seconds$/) do
  step 'the loading screen has expired'
  @question = check_page.question.text
  check_page.wait_for_question_timer_to_expire(5)
  expect(check_page).to have_preload
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

Then(/^I can answer the question using their phsyical keyboard$/) do
  check_page.wait_for_preload
  check_page.wait_for_question
  @question = check_page.question.text
  values = @question.gsub('=', '').split('×').map {|n| n.strip}
  check_page.enter_answer_via_keyboard(values.first.to_i * values.last.to_i)
  check_page.number_pad.one.send_keys(:enter)
  check_page.wait_for_question
  expect(check_page.question.text).to_not eql @question
end

Then(/^I should be able to use the on screen keyboard to complete the test$/) do
  questions = JSON.parse page.evaluate_script('window.localStorage.getItem("questions");')
  @answers = check_page.complete_check_with_correct_answers(questions.size,'numpad')
  expect(complete_page).to have_completion_text
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


Then(/^I should see the total number of check questions$/) do
  expect(check_page.preload.text).to eql 'Loading question 1 out of 20'
end
