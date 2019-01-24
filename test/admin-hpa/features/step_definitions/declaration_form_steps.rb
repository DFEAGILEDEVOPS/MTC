Given(/^I am on the HDF form page$/) do
  hdf_form_page.load
  @page = hdf_form_page
end

Given(/^all pupils have completed the check$/) do
  school_id = SqlDbHelper.find_teacher('teacher3')['school_id']
  SqlDbHelper.set_all_pupils_check_completed(school_id)
end

Given(/^all pupils have an attendance reason (.*)$/) do |value|
  teacher = SqlDbHelper.find_teacher('teacher3')
  SqlDbHelper.set_all_pupils_check_started(teacher['school_id'])
  SqlDbHelper.set_all_pupils_attendance_reason(teacher['school_id'], teacher['id'], value)
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
  expect(@page.error_summary.job_title.text).to eql 'Enter a job title'
  expect(@page.error_messages.map {|message| message.text}).to include 'Enter a job title'
end

Then(/^I should be taken to the attendance page$/) do
  expect(current_url).to eql "#{ENV["BASE_URL"]}/attendance/review-pupil-details"
end
