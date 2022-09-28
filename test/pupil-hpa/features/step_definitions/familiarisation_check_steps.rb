Given(/I am logged with familiarisation pin/) do
  step 'I have generated a familiarisation pin'
  step 'I have logged in'
end

Given(/^I am on the familiarisation complete page$/) do
  step 'I am logged with familiarisation pin'
  confirmation_page.read_instructions.click
  start_page.start_warm_up.click
  warm_up_page.start_now.click
  step "I complete the warm up questions using the keyboard"
  warm_up_complete_page.start_check.click
  mtc_check_start_page.start_now.click
  step 'I should be able to use the on screen keyboard to complete the test'
end

Given(/^I am on the warm up intro page for familiarisation check$/) do
  step "I am logged with familiarisation pin"
  confirmation_page.read_instructions.click
  start_page.start_warm_up.click
end

Given(/^I am on the instructions page for familiarisation check$/) do
  step 'I am logged with familiarisation pin'
  confirmation_page.read_instructions.click
end

Then(/^I can see familiarisation header section$/) do
  expect(confirmation_page).to have_familiarisation_header
end

And(/^I click start again link$/) do
  complete_page.start_again.click
end

Then(/^I am on the what to expect page$/) do
  expect(start_page).to be_displayed
end
