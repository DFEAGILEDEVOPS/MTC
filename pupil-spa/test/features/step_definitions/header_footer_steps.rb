Given(/^I am on the sign in page$/) do
  sign_in_page.load
end

Then(/^I should see a global header$/) do
  expect(sign_in_page).to have_global_header
end

Then(/^I should see a feedback text on the page$/) do
  expect(sign_in_page.phase_banner).to have_feedback
end

Then(/^I should see a footer with a link to crown copyright$/) do
  expect(sign_in_page).to have_footer_link
end

Given(/^I have logged in$/) do
  sign_in_page.load
  MongoDbHelper.expire_pin("Automated","Account",9991999,false)
  MongoDbHelper.reset_pin("Automated","Account",9991999,"9999a")
  @pupil_information = MongoDbHelper.find_pupil_via_pin("9999a")
  sign_in_page.login("abc12345","9999a")
  sign_in_page.sign_in_button.click
end

Given(/^I am on the welcome page$/) do
  step 'I have logged in'
end

Given(/^I am on the instructions page$/) do
  step 'I have logged in'
  confirmation_page.read_instructions.click
end

Given(/^I am on the complete page$/) do
  step 'I have started the check'
  step 'I should be able to use the on screen keyboard to complete the test'
end
