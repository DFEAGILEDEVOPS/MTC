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
  sign_in_page.pupil_pin.set '9999'
  sign_in_page.sign_in_button.click
end

Then(/^I should be taken to the confirmation page$/) do
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
  local_storage = page.evaluate_script('window.localStorage.getItem("config");')
  expect(local_storage).to be_nil
end

Given(/^I have attempted to enter a school I do not attend upon login$/) do
  sign_in_page.load
  MongoDbHelper.expire_pin("Automated","Account",9991999,false)
  MongoDbHelper.reset_pin("Automated","Account",9991999,"9999")
  @pupil_information = MongoDbHelper.find_pupil_via_pin("9999")
  schools = MongoDbHelper.get_list_of_schools.delete_if{|a| a['_id'] == @pupil_information['school']}
  sign_in_page.login(schools.first['schoolPin'],@pupil_information['pin'])
  sign_in_page.sign_in_button.click
end


Then(/^I should all the correct pupil details$/) do
  school = MongoDbHelper.find_school(9991999)['name']
  expect(confirmation_page.first_name.text).to eql "First name: #{@pupil_information['foreName']}"
  expect(confirmation_page.last_name.text).to  eql "Last name: #{@pupil_information['lastName']}"
  expect(confirmation_page.school_name.text).to  eql "School: #{school}"
  expect(confirmation_page.dob.text).to  eql "Date of Birth: #{@pupil_information['dob'].strftime("%-d %B %Y")}"
end


Given(/^I am logged in with a user who needs speech synthesis$/) do
  sign_in_page.load
  sign_in_page.login("abc12345","8888a")
  sign_in_page.sign_in_button.click
end


Then(/^I should see speech synthesis set to (.+) in the local storage$/) do |boolean|
  expect(confirmation_page).to be_displayed
  boolean = boolean == 'true' ? 'truthy' : 'falsey'
  expect(JSON.parse(page.evaluate_script('window.localStorage.getItem("config");'))['speechSynthesis']).to send("be_#{boolean}")
end


Given(/^I am logged in with a user who does not need speech synthesis$/) do
  step 'I have logged in'
end
