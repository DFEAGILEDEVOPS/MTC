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

Then(/^I should be taken to the sign in page$/) do
  expect(sign_in_page).to be_displayed
end

Then(/^local storage should be populated with questions and pupil metadata$/) do
  expect(confirmation_page).to be_displayed
  expect(JSON.parse page.evaluate_script('window.localStorage.getItem("questions");')).to_not be_nil
  expect(JSON.parse page.evaluate_script('window.localStorage.getItem("pupil");')).to_not be_nil
  expect(JSON.parse page.evaluate_script('window.localStorage.getItem("school");')).to_not be_nil
  expect(JSON.parse page.evaluate_script('window.localStorage.getItem("config");')).to_not be_nil
  expect(JSON.parse page.evaluate_script('window.localStorage.getItem("access_token");')).to_not be_nil
end

Then(/^pupil name is removed from local storage$/) do
  stored_pupil_metadata = JSON.parse page.evaluate_script('window.localStorage.getItem("pupil");')
  expect(stored_pupil_metadata['checkCode']).to_not be_nil
  expect(stored_pupil_metadata['firstName']).to be_nil
  expect(stored_pupil_metadata['lastName']).to be_nil
  expect(stored_pupil_metadata['dob']).to be_nil
end

When(/^I have chosen that the details are not correct$/) do
  expect(confirmation_page).to have_come_back_message
  confirmation_page.back_sign_in_page.click
end

Then(/^local storage should be cleared$/) do
  local_storage = page.evaluate_script('window.localStorage.getItem("config");')
  expect(local_storage).to be_nil
end

Given(/^I have attempted to enter a school I do not attend upon login$/) do
  sign_in_page.load
  ct = Time.now
  new_time = Time.new(ct.year, ct.mon, ct.day, 22, 00, 00, "+02:00").strftime("%Y-%m-%d %H:%M:%S.%LZ")
  SqlDbHelper.expire_pin("Standard","Pupil",1,false)
  SqlDbHelper.reset_pin("Standard","Pupil",1,new_time,"9999")
  @pupil_information = SqlDbHelper.find_pupil_via_pin("9999")
  schools = SqlDbHelper.get_list_of_schools.delete_if{|a| a['id'] == @pupil_information['school_id']}
  pin = 'tes23mo'
  SqlDbHelper.set_school_pin(schools.first['id'], new_time, pin)
  sign_in_page.login(pin,@pupil_information['pin'])
  binding.pry
  sign_in_page.sign_in_button.click
end


Then(/^I should see all the correct pupil details$/) do
  school = SqlDbHelper.find_school(1)['name']
  expect(confirmation_page.first_name.text).to eql "First name: #{@pupil_information['foreName']}"
  expect(confirmation_page.last_name.text).to  eql "Last name: #{@pupil_information['lastName']}"
  expect(confirmation_page.school_name.text).to  eql "School: #{school}"
  expect(confirmation_page.dob.text).to  eql "Date of birth: #{@pupil_information['dateOfBirth'].strftime("%-d %B %Y")}"
end


Given(/^I am logged in with a user who needs speech synthesis$/) do
  sign_in_page.load
  sign_in_page.login("abc12345","8888")
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

Then(/^the sign in button should be disabled$/) do
  expect(sign_in_page.sign_in_button).to be_disabled
end


Given(/^I have entered a school password$/) do
  step 'I am on the sign in page'
  sign_in_page.school_pin.set 'abc12345'
end


But(/^the sign in button is still disabled$/) do
  step 'the sign in button should be disabled'
end

When(/^I enter a pupil pin$/) do
  sign_in_page.pupil_pin.set '9999'
end

Then(/^I should see the sign in button enabled$/) do
  expect(sign_in_page.sign_in_button).to_not be_disabled
end


Given(/^I have entered a pupil pin$/) do
  step 'I am on the sign in page'
  sign_in_page.pupil_pin.set '9999'
end

When(/^I enter a school password$/) do
  sign_in_page.school_pin.set 'abc12345'
end


When(/^I want to try login with invalid credentials$/) do
  sign_in_page.login("abc15","8888")
  sign_in_page.sign_in_button.click
end

Then(/^I should see a failed login message$/) do
  expect(sign_in_page.login_failure).to be_all_there
end