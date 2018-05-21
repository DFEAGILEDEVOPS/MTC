Given(/^I am on the confirmation page$/) do
  step 'I have logged in'
  step 'I should be taken to the confirmation page'
end

When(/^I attempt to refresh the page$/) do
  visit current_url
end

Then(/^I should remain on the confirmation page$/) do
  step 'I should be taken to the confirmation page'
end

Then(/^I should remain on the instructions page$/) do
  step 'I should be taken to the instructions page'
end

Given(/^I have refreshed through the warm up questions$/) do
  step 'I am on the warm up check page'
  3.times do
    check_page.wait_for_preload
    check_page.wait_for_question(2)
    visit current_url
  end
end

Then(/^I should be taken to the warm up complete page$/) do
  expect(warm_up_complete_page).to be_displayed
  local_storage = JSON.parse(page.evaluate_script('window.localStorage.getItem("audit");'))
  expect(local_storage.select {|a| a['type'] == 'RefreshDetected'}.count).to eql 3
end

Then(/^I should remain on the warm up intro page$/) do
  expect(warm_up_page).to be_displayed
  expect(warm_up_page).to have_heading
end

Then(/^I should remain on the warm up complete page$/) do
  expect(warm_up_complete_page).to be_displayed
  expect(warm_up_complete_page).to have_heading
end

Given(/^I am on question (.*) of the check$/) do |number|
  @number = number.to_i
  step 'I have logged in'
  confirmation_page.read_instructions.click
  start_page.start_warm_up.click
  warm_up_page.start_now.click
  @question_strings = create_question_strings(JSON.parse(page.evaluate_script('window.localStorage.getItem("questions");')))
  step "I complete the warm up questions using the numpad"
  warm_up_complete_page.start_check.click
  check_page.wait_for_question
  check_page.wait_for_answer
  check_page.complete_check_with_correct_answers((@number-1), 'numpad') until check_page.question.text == @question_strings[@number -1]
end

But(/^the next question has loaded so I continue with the check$/) do
  unless @number == 10
    check_page.wait_for_preload
    check_page.wait_for_question
    expect(check_page.question.text).to eql @question_strings[@number]
    check_page.complete_check_with_correct_answers(@question_strings.size - @number, 'numpad')
  end
  complete_page.wait_for_complete_page
  expect(complete_page).to have_completion_text
end

Then(/^the audit and inputs recorded should reflect this$/) do
  refresh_audit_index = 24
  question_index = @number - 1
  audit_location_index = (question_index * 5) + refresh_audit_index
  expect(JSON.parse(page.evaluate_script('window.localStorage.getItem("audit");'))[audit_location_index]['type']).to eql 'RefreshDetected'
end


Then(/^I should remain on the complete page$/) do
  step 'I should see a complete page heading'
  step 'I should see some text stating i have completed the check'
end
