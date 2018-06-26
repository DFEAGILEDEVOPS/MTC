Given(/^I have read the instructions$/) do
  step 'I have logged in'
  confirmation_page.read_instructions.click
end

When(/^I choose to start the warm up questions$/) do
  start_page.start_warm_up.click
  warm_up_page.start_now.click
end

Then(/^I should have (\d+) seconds before I see the first question$/) do |arg1|
  check_page.wait_for_preload_to_expire
  expect(check_page).to have_question
end
