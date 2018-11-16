
When(/^I have selected all pupils$/) do
  manage_pupil_page.pupil_list.tick_all.click
end

Then(/^I should have the option to print pins$/) do
  expect(manage_pupil_page).to have_print_pins
end

Given(/^I have logged in with (.*)$/) do |teacher|
  sign_in_page.load
  sign_in_page.login(teacher, 'password')
end

When(/^I want to manage the pupils$/) do
  manage_pupil_page.load
end

And(/^I should see the date for the password$/) do
  t = Time.now
  expect(manage_pupil_page.school_password_information.password_date.text).to eql "School password for " + t.strftime("%-d %B %Y")
end

Then(/^there should not be a checkbox against the pupil$/) do
  expect(manage_pupil_page.find_pupil_row(@pupil_name)).to have_no_checkbox
end

Given(/^I have a pupil whose pin is expired$/) do
  step "I am logged in"
  MongoDbHelper.reset_pin('Pupil', 'Fifteen', 9991001)
  step "I am on the manage pupil page"
  manage_pupil_page.generate_pin_using_name('Pupil Fifteen')
  MongoDbHelper.expire_pin('Pupil', 'Fifteen', 9991001)
end


Then(/^I should see the pupil's pin as (.*)$/) do |text|
  expect(manage_pupil_page.find_pupil_row('Hallie Mosley').pin.text).to eql(text)
end

Given(/^I have a pupil whose pin is not generated$/) do
  step "I am logged in"
  MongoDbHelper.reset_pin('Pupil', 'Fifteen', 9991001)
end

