Given(/^I am on the manage pupil page$/) do
  manage_pupil_page.load
end

Then(/^I should see that all the pupils who are registered are displayed and sorted by lastname$/) do
  pupils_from_page = manage_pupil_page.pupil_list.pupil_row.map {|x| x.names.text}
  sorted_pupils_from_page = manage_pupil_page.pupil_list.pupil_row.map {|x| x.names.text}.sort
  expect(sorted_pupils_from_page).to match_array(pupils_from_page)
end

When(/^I click the Add Pupils link$/) do
  manage_pupil_page.add_pupil.click
end

And(/^I should see the added pupil details on the manage pupils page$/) do
  manage_pupil_page.load
  pupil_list = manage_pupil_page.pupil_list.pupil_row.map {|x| x.names.text}
  expect(pupil_list).to include(@details_hash[:first_name] + ' ' + @details_hash[:last_name])
end

And(/^I choose to add a pupil by clicking Add Pupils link$/) do
  manage_pupil_page.add_pupil.click
  step "I am on the add pupil page"
  step "I have submitted valid pupil details"
end

And(/^I choose to edit the first pupil in the list$/) do
  manage_pupil_page.pupil_list.pupil_row.first.edit_pupil_link.click
end

When(/^I have generated a pin for a pupil$/) do
  name = (0...8).map {(65 + rand(26)).chr}.join
  step "I am on the add pupil page"
  step "I submit the form with the name fields set as #{name}"
  step "the pupil details should be stored"
  step "I am on the manage pupil page"
  @pupil_name = manage_pupil_page.generate_pin_using_name(name)
end

Then(/^the pin should consist of (\d+) characters$/) do |size|
  manage_pupil_page.find_pupil_row(@pupil_name)
  expect(manage_pupil_page.find_pupil_row(@pupil_name).pin.text.size).to eql size.to_i
end

When(/^I choose to generate pupil pins for all pupils$/) do
  manage_pupil_page.pupil_list.tick_all.click
  manage_pupil_page.generate_pins.click
end

Then(/^all pupil pins should be generated from the specified pool of characters$/) do
  wait_until {manage_pupil_page.pupil_list.pupil_row.each {|pupil| pupil.pin.text !='n/a'}}
  # wait until all the pins are generated
  pins_array = manage_pupil_page.pupil_list.pupil_row.map {|pupil| pupil.pin.text} -["PIN expired"]
  pins_array.each {|pin| pin.split('').each {|char| expect("23456789bcdfghjkmnpqrstvwxyz").to include char}}
end

When(/^I have generated pins for multiple pupils$/) do
  @pupil_names = manage_pupil_page.generate_pin_for_multiple_pupils(5)
end

Then(/^each pin should be displayed next to the pupil its assigned to$/) do
  @pupil_names.each {|name| expect(manage_pupil_page.find_pupil_row(name)).to have_pin}
end

Then(/^the pupil pin should be unique$/) do
  pins_before = MongoDbHelper.pupil_pins
  expect(MongoDbHelper.pupil_pins.uniq).to eql pins_before
end

When(/^I have selected all pupils$/) do
  manage_pupil_page.pupil_list.tick_all.click
end

Then(/^I should have the option to print pins$/) do
  expect(manage_pupil_page).to have_print_pins
end

Then(/^the pin should be stored against the pupil$/) do
  pupil_upn = @stored_pupil_details['upn'].to_s
  wait_until{!(MongoDbHelper.pupil_details(pupil_upn)[:pin]).nil?}
  pupil_pin = MongoDbHelper.pupil_details(pupil_upn)[:pin]
  expect(manage_pupil_page.find_pupil_row(@pupil_name).pin.text).to eql pupil_pin
end

Given(/^I have logged in with (.*)$/) do |teacher|
  sign_in_page.load
  sign_in_page.login(teacher, 'password')
end

When(/^I want to manage the pupils$/) do
  profile_page.manage_pupil.click
end

Then(/^I should see the school password for (.*)$/) do |teacher|
  school_id = MongoDbHelper.find_teacher(teacher)[0]['school']
  school_password = MongoDbHelper.find_school(school_id)[0]['schoolPin']
  expect(manage_pupil_page.school_password_information.password.text).to eql school_password
end

And(/^I should see the date for the password$/) do
  t = Time.now
  expect(manage_pupil_page.school_password_information.password_date.text).to eql "School password for " + t.strftime("%-d %B %Y")
end

Then(/^there should not be a checkbox against the pupil$/) do
  expect(manage_pupil_page.find_pupil_row(@pupil_name)).to have_no_checkbox
end

Given(/^I have a pupil whose pin is expired$/) do
  MongoDbHelper.reset_pin('Pupil', 'Fifteen', 9991001)
  step "I am on the manage pupil page"
  manage_pupil_page.generate_pin_using_name('Pupil Fifteen')
  MongoDbHelper.expire_pin('Pupil', 'Fifteen', 9991001)
end


Then(/^I should see the pupil's pin as (.*)$/) do |text|
  expect(manage_pupil_page.find_pupil_row('Pupil Fifteen').pin.text).to eql(text)
end

Given(/^I have a pupil whose pin is not generated$/) do
  MongoDbHelper.reset_pin('Pupil', 'Fifteen', 9991001)
end

