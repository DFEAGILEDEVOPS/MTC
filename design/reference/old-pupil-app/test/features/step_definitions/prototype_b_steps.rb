Given(/^5 digit pins have been generated$/) do
  school_id = 9991001
  @array_of_pins = MongoDbHelper.pupil_pin_retriever(school_id)
end

Then(/^they should only consist of alphanumeric characters$/) do
  @array_of_pins.compact.each {|pin| pin.split('').each {|char| expect("23456789bcdfghjkmnpqrstvwxyz").to include(char), "#{pin} includes a invalid character please investigate"}}
end

Then(/^I should see a field for the first letter of pupil name$/) do
  expect(sign_in_page).to have_first_letter
end

Given(/^I have entered an invalid pin$/) do
  step 'I am on the sign in page'
  sign_in_page.login('XY12','ABC12')
  sign_in_page.sign_in_button.click
end

Then(/^I should see a validation error$/) do
expect(sign_in_failure_page).to have_heading
expect(sign_in_failure_page).to have_error_message
end

Given(/^I have entered ABCD for my pin$/) do
  step 'I am on the sign in page'
  sign_in_page.login('1234')
  sign_in_page.sign_in_button.click
end

Given(/^I have not entered valid pins$/) do
  @current_failed_attempts = MongoDbHelper.failed_login_attempts
  sign_in_page.load
  sign_in_page.school_pin.set('13231')
  sign_in_page.pupil_pin.set('12123')
  sign_in_page.sign_in_button.click
end


Given(/^I am on the validation error page$/) do
  step 'I have entered an invalid pin'
  step 'I should see a validation error'
end

When(/^I click the link to try again$/) do
 sign_in_failure_page.retry_sign_in.click
end

