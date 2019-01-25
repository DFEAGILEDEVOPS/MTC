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

Given(/^I am on the review pupil detail page$/) do
  step 'I have a new pupil with a reason for not taking a check'
  step 'I am on the HDF form page'
  step 'I submit the form with the hdf name fields set as Test'
end

Given(/^I have a new pupil with a reason for not taking a check$/) do
  name = (0...8).map {(65 + rand(26)).chr}.join
  step "I am on the add pupil page"
  step "I submit the form with the name fields set as #{name}"
  step "the pupil details should be stored"

  pupils_not_taking_check_page.load
  pupils_not_taking_check_page.add_reason.click
  page.execute_script "window.scrollBy(0,500)"
  @page = pupil_reason_page
  pupil_reason_page.select_reason('Absent')
  @pupil_row = pupil_reason_page.pupil_list.rows.select {|row| row.name.text.include?(name)}
  @pupil_forename = @pupil_row.first.name.text.split(',')[1].strip
  @pupil_lastname = @pupil_row.first.name.text.split(',')[0].strip
  @pupil_row.first.checkbox.click
  pupil_reason_page.sticky_banner.confirm.click

  step 'the Absent reason should be stored against the pupils'
end

And(/^headteacher select the pupil for updating its reason$/)do
  declaration_page.select_pupil(@pupil_forename)
end

Then(/^edit reason page is displayed as per design$/) do
  expect(edit_reason_for_hdf_pupil_page.pupil_name.text.eql?("#{@pupil_lastname}, #{@pupil_forename}")).to be_truthy, "Expected Pupil name: #{@pupil_lastname}, #{@pupil_forename}....But Actual: #{edit_reason_for_hdf_pupil_page.pupil_name.text}"
  expect(edit_reason_for_hdf_pupil_page).to have_attendance_codes
end

When(/^headteacher edit reason for a pupil from HDF pupil list$/) do
  edit_reason_for_hdf_pupil_page.select_reason(@reason)
  edit_reason_for_hdf_pupil_page.save.click
end

Given(/^headteacher has updated reason '(.*)' for a pupil$/) do |reason|
  @reason = reason
  step 'I am on the review pupil detail page'
  step 'headteacher select the pupil for updating its reason'
  step 'headteacher edit reason for a pupil from HDF pupil list'
end

Then(/^reason is updated for the pupil on HDF review pupil detail page$/) do
  actual_reason = declaration_page.get_pupil_reason(@pupil_forename)
  expect(actual_reason.eql?(@reason)). to be_truthy, "Expected Reason: #{@reason}... But Actual: #{actual_reason}"
end
