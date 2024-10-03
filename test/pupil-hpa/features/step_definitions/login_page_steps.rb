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
  step 'I have generated a live pin'
  step 'I login to the admin app'
  visit ENV['ADMIN_BASE_URL'] + generate_pins_overview_page.url
  school_2_password = SqlDbHelper.find_school(2)['pin']
  @checks_count = SqlDbHelper.number_of_checks
  sign_in_page.load
  sign_in_page.login(school_2_password, @pupil_credentials[:pin])
  sign_in_page.sign_in_button.click
end


Then(/^I should see all the correct pupil details$/) do
  school = SqlDbHelper.find_school(SqlDbHelper.pupil_details(@details_hash[:upn])['school_id'])['name']
  expect(confirmation_page.first_name.text).to eql "First name: #{@details_hash[:first_name]}"
  expect(confirmation_page.last_name.text).to eql "Last name: #{@details_hash[:last_name]}"
  expect(confirmation_page.school_name.text).to eql "School: #{school}"
  expect(confirmation_page.dob.text).to eql "Date of birth: " + Date.parse(@details_hash[:year] + '-'+ @details_hash[:month] + '-'+@details_hash[:day]).strftime("%-d %B %Y")
end


Given(/^I am logged in with a user who needs speech synthesis$/) do
  sign_in_page.load
  sign_in_page.login("abc12345", "8888")
  sign_in_page.sign_in_button.click
end


Then(/^I should see question reader set to (.+) in the local storage$/) do |boolean|
  sleep 2
  boolean = boolean == 'true' ? 'truthy' : 'falsey'
  expect(JSON.parse(page.evaluate_script('window.localStorage.getItem("config");'))['questionReader']).to send("be_#{boolean}")
end


Given(/^I am logged in with a user who does not need question reader$/) do
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
  sign_in_page.login("abc15", "8888")
  sign_in_page.sign_in_button.click
end

Then(/^I should see a failed login message$/) do
  expect(sign_in_page.login_failure).to be_all_there
end

When(/^I submit the form with the name fields set as (.*)$/) do |value|
  @upn = UpnGenerator.generate
  dob = calculate_age(8)
  @details_hash = {first_name: value, middle_name: value, last_name: value, upn: @upn, female: true, day: dob.day.to_s, month: dob.month.to_s, year: dob.year.to_s}
  add_pupil_page.enter_details(@details_hash)
  add_pupil_page.add_pupil.click
  @time_stored = Helpers.time_to_nearest_hour(Time.now.utc)
end

Then(/^the pupil details should be stored$/) do
  gender = @details_hash[:male] ? 'M' : 'F'
  wait_until {!(SqlDbHelper.pupil_details(@upn.to_s)).nil?}
  @stored_pupil_details = SqlDbHelper.pupil_details @upn.to_s
  expect(@details_hash[:first_name]).to eql @stored_pupil_details['foreName']
  expect(@details_hash[:middle_name]).to eql @stored_pupil_details['middleNames']
  expect(@details_hash[:last_name]).to eql @stored_pupil_details['lastName']
  expect(gender).to eql @stored_pupil_details['gender']
  expect(@details_hash[:upn].to_s.upcase).to eql @stored_pupil_details['upn']
  expect(Time.parse(@details_hash[:day]+ "-"+ @details_hash[:month]+"-"+ @details_hash[:year]).strftime("%d %m %y")).to eql (@stored_pupil_details['dateOfBirth']).strftime("%d %m %y")
  expect(@time_stored).to eql Helpers.time_to_nearest_hour(@stored_pupil_details['createdAt'])
  expect(@time_stored).to eql Helpers.time_to_nearest_hour(@stored_pupil_details['updatedAt'])
end

When(/^I add a pupil$/) do
  @name = (0...8).map {(65 + rand(26)).chr}.join
  step 'I login to the admin app'
  visit ENV['ADMIN_BASE_URL'] + add_pupil_page.url
  step "I submit the form with the name fields set as #{@name}"
  step "the pupil details should be stored"
end

When(/^I add a pupil who has non utf characters in their name$/) do
  @name = "Güneş"
  step 'I login to the admin app'
  visit ENV['ADMIN_BASE_URL'] + add_pupil_page.url
  step "I submit the form with the name fields set as #{@name}"
  step "the pupil details should be stored"
end

When(/^I login to the admin app$/) do
  visit ENV['ADMIN_BASE_URL'] + '/sign-out'
  visit ENV['ADMIN_BASE_URL']
  admin_sign_in_page.login(@username, 'password')
end

When(/^I have generated a familiarisation pin$/) do
  step 'I add a pupil'
  step 'I login to the admin app'
  navigate_to_pupil_list_for_pin_gen('tio')
  generate_pins_familiarisation_overview_page.generate_pin_using_name(@details_hash[:last_name] + ', ' + @details_hash[:first_name])
  pupil_pin_row = view_and_print_pins_page.pupil_list.rows.find {|row| row.name.text == @details_hash[:last_name] + ', ' + @details_hash[:first_name]}
  @pupil_credentials = {:school_password => pupil_pin_row.school_password.text, :pin => pupil_pin_row.pin.text}
  RedisHelper.wait_for_prepared_check(@pupil_credentials[:school_password],@pupil_credentials[:pin])
end

When(/^I have generated a live pin$/) do
  step 'I add a pupil'
  step 'I login to the admin app'
  navigate_to_pupil_list_for_pin_gen('live')
  generate_pins_overview_page.generate_pin_using_name(@details_hash[:last_name] + ', ' + @details_hash[:first_name])
  pupil_pin_row = view_and_custom_print_live_check_page.pupil_list.rows.find {|row| row.name.text == @details_hash[:last_name] + ', ' + @details_hash[:first_name]}
  @pupil_credentials = {:school_password => pupil_pin_row.school_password.text, :pin => pupil_pin_row.pin.text}
  p @pupil_credentials
  RedisHelper.wait_for_prepared_check(@pupil_credentials[:school_password],@pupil_credentials[:pin])
end

Given(/^I navigate to the pupil spa$/) do
  visit ENV['PUPIL_BASE_URL']
end

Then(/^I should see a loading page$/) do
  expect(connectivity_check_page).to be_displayed
end

And(/^if successful should be taken to the sign in page$/) do
  Timeout.timeout(8){sleep 0.2 until current_url.include? sign_in_page.url}
end

Given(/^I navigate to the sign in page with local storage disabled$/) do
  sign_in_page.load
end

Then(/^I should see the local storage error page$/) do
  expect(local_storage_error_page).to be_displayed
  expect(local_storage_error_page).to have_heading
  expect(local_storage_error_page).to have_teacher_instructions
end
