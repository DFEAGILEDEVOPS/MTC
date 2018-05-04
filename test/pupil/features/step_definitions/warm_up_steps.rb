Given(/^I am on the warm up intro page$/) do
  step "I have logged in"
  confirmation_page.read_instructions.click
  start_page.start_warm_up.click
end

Then(/^I should see a warm up page heading$/) do
  expect(warm_up_page).to have_heading
end

Given(/^I am on the warm up check page$/) do
  step 'I am on the warm up intro page'
  warm_up_page.start_now.click
end

Given(/^I should be able to use the (.+) to complete the warm up questions$/) do |input_type|
  input = input_type == 'on screen keyboard' ? 'numpad' : 'keyboard'
  check_page.complete_check_with_correct_answers(3, input)
  expect(warm_up_complete_page).to have_completion_text
end

And(/^I could answer the question within the configured time$/) do
  check_page.wait_for_preload
  check_page.wait_for_question(2)
  @question = check_page.question.text
  check_page.complete_question('1234', 'numpad')
end

Then(/^I should see a warm up label$/) do
  expect(warm_up_page).to have_warm_up_label
end

Then(/^I should see a warm up label on the complete page$/) do
  expect(warm_up_complete_page).to have_warm_up_label
end

Then(/^I am on the warm up complete page$/) do
  step "I have logged in"
  confirmation_page.read_instructions.click
  start_page.start_warm_up.click
  warm_up_page.start_now.click
  step 'I should be able to use the numpad to complete the warm up questions'
end

Then(/^I should see a warm up complete heading$/) do
  expect(warm_up_complete_page).to have_heading
end

Then(/^I should see a way to start the check$/) do
  expect(warm_up_complete_page).to have_start_check
end


Given(/^I am on the warm up loading page$/) do
  step "I am on the warm up check page"
  wait_until {check_page.has_preload?}
end

Then(/^I should see the total number of warm up questions$/) do
  expect(warm_up_page.welcome_message.text.scan(/\d+/).first.to_i).to eql 3
end
