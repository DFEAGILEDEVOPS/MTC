Given(/^I am on the admin page$/) do
  admin_page.load
end

When(/^I am on the check settings page$/) do
  admin_page.check_settings.click
end

When(/^I have updated the question time limit to (\d+) seconds$/) do |limit|
  step 'I am on the check settings page'
  check_settings_page.update_question_time_limit(limit)
end

Then(/^I should see that question time limit is set to (\d+) seconds$/) do |limit|
  expect(check_settings_page.question_time_limit.value).to eql limit
end

When(/^I attempt to enter question time limit as (.*) seconds$/) do |limit|
  step 'I am on the check settings page'
  check_settings_page.update_question_time_limit(limit)
end

Then(/^I should see a validation error for question time limit$/) do
  expect(check_settings_page.error_message.text).to eql "Question time limit requires a number between 1 and 60, up to two decimals are valid"
  expect(check_settings_page.error_summary_list.text).to eql "Question time limit requires a number between 1 and 60, up to two decimals are valid"
end

When(/^I have updated the question time limit to (\d+)\.(\d+) seconds$/) do |whole_number, decimal|
  step 'I am on the check settings page'
  check_settings_page.update_question_time_limit(whole_number+'.'+decimal)
end

Then(/^I should see that question time limit is set to (\d+)\.(\d+) seconds$/) do |whole_number, decimal|
  expect(check_settings_page.question_time_limit.value).to eql(whole_number+'.'+decimal)
end

When(/^I update the question time limit from (\d+) to (\d+) seconds$/) do |limit, new_limit|
  step 'I am on the check settings page'
  check_settings_page.update_question_time_limit(limit)
  visit current_url
  check_settings_page.update_question_time_limit(new_limit)
end

Then(/^I should see a record that has date and time of the question time limit change to (\d+) in database$/) do |arg|
  wait_until{SqlDbHelper.get_settings['questionTimeLimit'] == arg.to_i}
end

Then(/^I should see a historic record appended for question Time limit change to (\d+) in the database$/) do |arg|
  wait_until{SqlDbHelper.latest_setting_log['questionTimeLimit'] == arg.to_i}
end

Then(/^I should see that time between questions is set to (\d+) seconds$/) do |limit|
  expect(check_settings_page.loading_time_limit.value).to eql limit
end

When(/^I have updated the time between questions to (\d+) seconds$/) do |limit|
  step 'I am on the check settings page'
  check_settings_page.update_loading_time_limit(limit)
end

When(/^I attempt to enter time between questions as (.*) seconds$/) do |limit|
  step 'I am on the check settings page'
  check_settings_page.update_loading_time_limit(limit)
end

Then(/^I should see a validation error for Time between questions$/) do
  expect(check_settings_page.error_message.text).to eql 'Time between questions requires a number between 1 and 5, up to two decimals are valid'
  expect(check_settings_page.error_summary_list.text).to eql 'Time between questions requires a number between 1 and 5, up to two decimals are valid'
end

And(/^I have updated the time between questions to (\d+)\.(\d+) seconds$/) do |whole_number, decimal|
  step 'I am on the check settings page'
  check_settings_page.update_loading_time_limit(whole_number+'.'+decimal)
end

Then(/^I should see that time between questions is set to (\d+)\.(\d+) seconds$/) do |whole_number, decimal|
  expect(check_settings_page.loading_time_limit.value).to eql(whole_number+'.'+decimal)
end

When(/^I update the time between questions from (\d+) to (\d+) seconds$/) do |limit, new_limit|
  step 'I am on the check settings page'
  check_settings_page.update_loading_time_limit(limit)
  visit current_url
  check_settings_page.update_loading_time_limit(new_limit)
end

Then(/^I should see a record that has date and time of the Time between questions change to (\d+) in database$/) do |arg|
  wait_until{SqlDbHelper.get_settings['loadingTimeLimit'] == arg.to_i}
end

Then(/^I should see a historic record appended for Time between questions change to (\d+) in the database$/) do |arg|
  wait_until{SqlDbHelper.latest_setting_log['loadingTimeLimit'] == arg.to_i}
end