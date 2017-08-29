Then(/^I should see a STA logo$/) do
  expect(sign_in_page).to have_logo
end

Then(/^I should see a sign in page heading$/) do
  expect(sign_in_page).to have_heading
end

Then(/^I should see some sign in page intro text$/) do
  expect(sign_in_page).to have_welcome_message
end

Then(/^I should see a sign in button$/) do
  expect(sign_in_page).to have_sign_in_button
end

When(/^I attempt to login with just a school pin$/) do
  sign_in_page.school_pin.set 'acb12345'
  sign_in_page.sign_in_button.click
end

Then(/^I should be taken to the sign in failure page$/) do
  expect(sign_in_failure_page).to be_displayed
end

When(/^I attempt to login with just a pupil pin$/) do
  sign_in_page.pupil_pin.set '9999a'
  sign_in_page.sign_in_button.click
end

Then(/^I should be taken to the instructions page$/) do
  expect(confirmation_page).to be_displayed
end

When(/^I have not entered any sign in details$/) do
  sign_in_page.sign_in_button.click
end

Given(/^I am on the login failure page$/) do
  sign_in_failure_page.load
end

When(/^I want to try logging in again$/) do
  sign_in_failure_page.retry_sign_in.click
end

Then(/^I should be taken to the sign in page$/) do
  expect(sign_in_page).to be_displayed
end

Then(/^I should see a sign in page failure heading$/) do
  expect(sign_in_failure_page).to have_heading
end

Then(/^I should see some text instructing me on what to do next$/) do
  expect(sign_in_failure_page).to have_error_message
end

Then(/^local storage should be populated with questions and pupil metadata$/) do
  expect(confirmation_page).to be_displayed
  expect(JSON.parse page.evaluate_script('window.localStorage.getItem("questions");')).to_not be_nil
  expect(JSON.parse page.evaluate_script('window.localStorage.getItem("pupil");')).to_not be_nil
  expect(JSON.parse page.evaluate_script('window.localStorage.getItem("school");')).to_not be_nil
  expect(JSON.parse page.evaluate_script('window.localStorage.getItem("config");')).to_not be_nil
  expect(JSON.parse page.evaluate_script('window.localStorage.getItem("access_token");')).to_not be_nil
end

When(/^I have chosen that the details are not correct$/) do
  confirmation_page.back_sign_in_page.click
end

Then(/^local storage should be cleared$/) do
  local_storage = page.evaluate_script('window.localStorage.getItem("data");')
  expect(local_storage).to be_nil
end
