Given(/^I want to edit a previously added pupil$/) do
  step 'I am logged in'
  pupil_name = (0...8).map {(65 + rand(26)).chr}.join
  step "I am on the add pupil page"
  step "I submit the form with the name fields set as #{pupil_name}"
  step "the pupil details should be stored"
  @page = edit_pupil_page
  # pupil_register_page.load
  @pupil = pupil_register_page.find_pupil_row(pupil_name)
  @pupil.edit_pupil_link.click
end

When(/^I update with valid pupil data$/) do
  @updated_upn = UpnGenerator.generate
  pupil_name = (0...8).map {(65 + rand(26)).chr}.join
  @updated_details_hash = {first_name: pupil_name, middle_name: pupil_name, last_name: pupil_name, upn: @updated_upn, male: true, day: '16', month: '01', year: '2010'}
  @updated_details_hash[:upn]=@upn if @page == edit_pupil_page
  @updated_upn = @upn if @page == edit_pupil_page
  @page.enter_details(@updated_details_hash)
  @page.save_changes.click
end

Then(/^this should be saved$/) do
  gender = @updated_details_hash[:male] ? 'M' : 'F'
  wait_until{!(SqlDbHelper.pupil_details(@updated_upn.to_s)).nil?}
  @stored_pupil_details = SqlDbHelper.pupil_details @updated_upn.to_s
  expect(@updated_details_hash[:first_name]).to eql @stored_pupil_details['foreName']
  expect(@updated_details_hash[:middle_name]).to eql @stored_pupil_details['middleNames']
  expect(@updated_details_hash[:last_name]).to eql @stored_pupil_details['lastName']
  expect(gender).to eql @stored_pupil_details['gender']
  expect(@updated_details_hash[:upn].to_s).to eql @stored_pupil_details['upn']
  expect(Time.parse(@updated_details_hash[:day]+ "-"+ @updated_details_hash[:month]+"-"+ @updated_details_hash[:year])).to eql @stored_pupil_details['dateOfBirth']
  expect(@time_stored).to eql Helpers.time_to_nearest_hour(@stored_pupil_details['createdAt'])
  expect(@time_stored).to eql Helpers.time_to_nearest_hour(@stored_pupil_details['updatedAt'])
end


Then(/^I should see validation errors when i submit with the following names$/) do |table|
  table.raw.flatten.each do |value|
    @upn = UpnGenerator.generate unless @page == edit_pupil_page
    @details_hash = {first_name: value, middle_name: value, last_name: value, upn: @upn, female: true, day: '18', month: '02', year: '2010'}
    @page.enter_details(@details_hash)
    @page.add_pupil.click unless @page == edit_pupil_page
    @page.save_changes.click if @page == edit_pupil_page
    @time_stored = Time.now.utc.strftime("%Y-%m-%d %H")
    expect(@page.error_summary.first_name.text).to eql "First name can't contain special character"
    expect(@page.error_messages.map{|message| message.text}).to include "First name can't contain special character"
    expect(@page.error_summary.middle_name.text).to eql 'Check the middle name does not contain special characters'
    expect(@page.error_messages.map{|message| message.text}).to include 'Check the middle name does not contain special characters'
    expect(@page.error_summary.last_name.text).to eql "Last name can't contain special characters"
    expect(@page.error_messages.map{|message| message.text}).to include "Last name can't contain special characters"
  end
end

And(/^I should see a flash message to state the pupil has been updated$/) do
  expect(pupil_register_page).to have_info_message
  hightlighted_row = pupil_register_page.pupil_list.pupil_row.find{|row| row.has_edited_pupil?}
  expect(hightlighted_row.text).to include("#{@updated_details_hash[:last_name]}, #{@updated_details_hash[:first_name]}")
end

And(/^I should see no flash message displayed$/) do
  expect(pupil_register_page).to have_no_info_message
  expect(pupil_register_page).to have_no_edited_pupil
end


Then(/^the pupil details should not be updated$/) do
  wait_until {(SqlDbHelper.pupil_details @upn.to_s)}
  stored_details = SqlDbHelper.pupil_details @upn.to_s
  expect(stored_details['foreName']).to_not eql @details_hash[:first_name]
  expect(stored_details['middleName']).to_not eql @details_hash[:middle_name]
  expect(stored_details['lastName']).to_not eql @details_hash[:last_name]
  expect(stored_details['upn']).to eql @details_hash[:upn]
end