Given(/^I have started the check$/) do
  step 'I have logged in'
  confirmation_page.read_instructions.click
  start_page.start_check.click
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
  expect(check_page.question.text).to_not eql @question
end

Then(/^the route remains the same$/) do
  expected_url = Capybara.app_host + '/check'
  expect(current_url).to eql expected_url
  check_page.wait_for_preload_to_expire(2)
  check_page.wait_for_question
  expect(current_url).to eql expected_url
end
