Given(/^I am on the HDF form page$/) do
  hdf_form_page.load
  @page = hdf_form_page
end

Then(/^I can see hdf form page as per the design$/) do
  expect(@page).to have_first_name
  expect(@page).to have_last_name
  expect(@page).to have_is_headteacher_yes
  expect(@page).to have_is_headteacher_no
  expect(@page).to have_continue
end

When(/^I click on the not a headteacher radio box$/) do
  @page.is_headteacher_no.click
end

When(/^I attempt to enter hdf names that are more than (\d+) characters long$/) do |number|
  @long_name = ('F' * (number.to_i + 1))
  @details_hash = {first_name: @long_name, last_name: @long_name}
  @page.enter_details(@details_hash)
  @page.continue.click
end

When(/^I submit the form with names that are less than 1 character long$/) do
  @details_hash = {first_name: '', last_name: ''}
  @page.enter_details(@details_hash)
  @page.continue.click
end

When(/^I submit the form with the hdf name fields set as (.*)$/) do |value|
  @details_hash = {first_name: value, last_name: value}
  @page.enter_details(@details_hash)
  @page.continue.click
end

Then(/^I should see validation errors when I submit with the following hdf names$/) do |table|
  table.raw.flatten.each do |value|
    @details_hash = {first_name: value, last_name: value}
    @page.enter_details(@details_hash)
    @page.continue.click
    expect(@page.error_summary.hdf_first_name.text).to eql "Enter a forename without special characters"
    expect(@page.error_messages.map{|message| message.text}).to include "Enter a forename without special characters"
    expect(@page.error_summary.last_name.text).to eql "Enter a surname without special characters"
    expect(@page.error_messages.map{|message| message.text}).to include "Enter a surname without special characters"
  end
end

Then(/^I should see a validation error for names$/) do
  expect(@page.error_summary.hdf_first_name.text).to eql 'Enter a forename in no more than 128 characters'
  expect(@page.error_messages.map {|message| message.text}).to include 'Enter a forename in no more than 128 characters'
  expect(@page.error_summary.last_name.text).to eql 'Enter a surname in no more than 128 characters'
  expect(@page.error_messages.map {|message| message.text}).to include 'Enter a surname in no more than 128 characters'
end

Then(/^I should see a validation error for job title$/) do
  expect(@page.error_summary.job_title.text).to eql 'Enter a job title in no more than 128 characters'
  expect(@page.error_messages.map {|message| message.text}).to include 'Enter a job title in no more than 128 characters'
end

Then(/^I should be taken to the attendance page$/) do
  expect(current_url).to eql "#{ENV["ADMIN_BASE_URL"]}/attendance/review-pupil-details"
end


Given(/^I generate a live pin$/) do
  name = (0...8).map {(65 + rand(26)).chr}.join
  step "I am on the add pupil page"
  step "I submit the form with the name fields set as #{name}"
  step "the pupil details should be stored"
  navigate_to_pupil_list_for_pin_gen('live')
  @pupil_forename = name
  @page = generate_live_pins_overview_page
  @pupil_name = generate_live_pins_overview_page.generate_pin_using_name(name)
  pupil_pin_row = view_and_print_live_pins_page.pupil_list.rows.find {|row| row.name.text == @pupil_name}
  @pupil_credentials = {:school_password => pupil_pin_row.school_password.text, :pin => pupil_pin_row.pin.text}
  @check_code = SqlDbHelper.check_details(@stored_pupil_details['id'])['checkCode']
end

Given('the pin expires') do
  @pupil_details = SqlDbHelper.pupil_details_using_school(@details_hash[:upn], @school_id)
  @check_details = SqlDbHelper.get_all_pupil_checks(@pupil_details['id']).sort_by {|hsh| hsh['createdAt']}.last
  SqlDbHelper.delete_check_pin(@check_details["id"])
end

Then('I should not be able to sign the HDF') do
  visit ENV['ADMIN_BASE_URL'] + '/sign-out'
  step "I am logged in"
  step 'I am on the HDF form page'
  expect(@page).to_not have_first_name
  expect(@page).to_not have_last_name
  expect(@page).to_not have_is_headteacher_yes
  expect(@page).to_not have_is_headteacher_no
  expect(@page).to_not have_continue
end
