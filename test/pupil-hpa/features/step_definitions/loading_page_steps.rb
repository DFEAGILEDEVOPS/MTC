Given(/^I have read the instructions$/) do
  step 'I have logged in'
  confirmation_page.read_instructions.click
end

Given(/^I have read the instructions and seen the settings page$/) do
  step 'I have read the instructions'
  access_arrangements_setting_page.next_btn.click
end

When(/^I choose to start the warm up questions$/) do
  start_page.start_warm_up.click
  warm_up_page.start_now.click
end

Then(/^I should have (\d+) seconds before I see the first question$/) do |arg1|
  check_page.wait_for_preload_to_expire
  expect(check_page).to have_question
end

Then(/^I should not see the modal dialog$/) do
  expect(loading_page).not_to have_idle_modal
end

Then(/^I should see the modal dialog after the idle timeout expires$/) do
  # We dont have a method of reducing the 30 second idle modal timeout, so we call showWarningModal() manually
  page.evaluate_script("ng.probe(document.getElementsByTagName('app-loading')[0]).componentInstance.showWarningModal()")
  expect(loading_page).to have_idle_modal
end

When(/^I have been idle for (\d+) seconds$/) do |arg1|
  loading_page.wait_for_idle_to_expire arg1
end

Then(/^I should see the next button$/) do
  expect(loading_page).to have_next_button
end

Given(/^I start the questions$/) do
  warm_up_complete_page.start_check.click
start_mtc
end

Then(/^I should be redirected when the check time limit expires$/) do
  config = JSON.parse(page.evaluate_script("window.localStorage.getItem('config');"))
  config['checkTime'] = 1
  page.evaluate_script("window.localStorage.setItem('config', '#{JSON.generate(config)}');")
  visit '/check'
  step 'I have been idle for 2 seconds'
  expected_path = '/out-of-time'
  expect(current_path).to eql expected_path
end
