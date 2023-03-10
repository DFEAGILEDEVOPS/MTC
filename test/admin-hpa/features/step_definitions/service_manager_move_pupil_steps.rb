Given(/^I am on the pupil summary page for a pupil to be moved$/) do
  step "I am on the pupil search page"
  step "I search for a pupil using their upn"
  @pupil_details_before_move = SqlDbHelper.pupil_details_by_upn(@upn)
end

When(/^I move the pupil to a different school$/) do
  pupil_summary_page.move_pupil.click
  current_urn = move_pupil_page.urn.text.to_i
  array_of_urns = SqlDbHelper.list_all_schools.map {|school| school['urn']}
  array_of_urns.delete current_urn
  @target_urn = array_of_urns.sample
  move_pupil_page.target_school_urn.set @target_urn
  move_pupil_page.confirm.click
  expect(confirm_move_pupil_page.pupil_name.text).to eql "#{@pupil_details_before_move['lastName']}, #{@pupil_details_before_move['foreName']}"
  expect(confirm_move_pupil_page.moving_pupil_text.text).to eql "Moving #{@pupil_details_before_move['lastName']}, #{@pupil_details_before_move['middleNames']} #{@pupil_details_before_move['foreName']} (DOB: #{@pupil_details_before_move['dateOfBirth'].strftime("%-d %b %Y")})"
  expect(confirm_move_pupil_page.from_school_text.text).to eql "From school: #{@school['entity']['name']} (DfE# #{@school['entity']['dfeNumber']})"
  @target_school_details = SqlDbHelper.find_school_by_urn(@target_urn)
  expect(confirm_move_pupil_page.to_school_text.text).to eql "To school: #{@target_school_details['name']} URN: #{@target_school_details['urn']} DFE number: #{@target_school_details['dfeNumber']}"
  confirm_move_pupil_page.confirm_move_pupil.click
end

Then(/^the pupil should be moved to the target school$/) do
  expect(pupil_summary_page.confirm_move_flash.text).to eql "Pupil moved to #{@target_school_details['name']} (#{@target_school_details['urn']})"
  pupil_details_after_move = SqlDbHelper.pupil_details_by_upn(@upn)
  expect(pupil_details_after_move['school_id']).to eql @target_school_details['id']
  expect(@pupil_details_before_move['school_id']).to_not eql @target_school_details['id']
end


When(/^I cancel moving a pupil to a different school$/) do
  pupil_summary_page.move_pupil.click
  current_urn = move_pupil_page.urn.text.to_i
  array_of_urns = SqlDbHelper.list_all_schools.map {|school| school['urn']}
  array_of_urns.delete current_urn
  @target_urn = array_of_urns.sample
  move_pupil_page.target_school_urn.set @target_urn
  move_pupil_page.confirm.click
  expect(confirm_move_pupil_page.pupil_name.text).to eql "#{@pupil_details_before_move['lastName']}, #{@pupil_details_before_move['foreName']}"
  expect(confirm_move_pupil_page.moving_pupil_text.text).to eql "Moving #{@pupil_details_before_move['lastName']}, #{@pupil_details_before_move['middleNames']} #{@pupil_details_before_move['foreName']} (DOB: #{@pupil_details_before_move['dateOfBirth'].strftime("%-d %b %Y")})"
  expect(confirm_move_pupil_page.from_school_text.text).to eql "From school: #{@school['entity']['name']} (DfE# #{@school['entity']['dfeNumber']})"
  @target_school_details = SqlDbHelper.find_school_by_urn(@target_urn)
  expect(confirm_move_pupil_page.to_school_text.text).to eql "To school: #{@target_school_details['name']} URN: #{@target_school_details['urn']} DFE number: #{@target_school_details['dfeNumber']}"
  confirm_move_pupil_page.cancel.click
end

Then(/^the pupil should not be moved$/) do
  expect(pupil_summary_page).to be_displayed
  pupil_details_after_cancel = SqlDbHelper.pupil_details_by_upn(@upn)
  expect(@pupil_details_before_move).to eql pupil_details_after_cancel
end


When(/^I attempt to move a pupil without entering a target school$/) do
  pupil_summary_page.move_pupil.click
  move_pupil_page.target_school_urn.set ''
  move_pupil_page.confirm.click
end

Then(/^I should see an error stating target school is required$/) do
  expect(move_pupil_page.error_summary.text).to eql "No target school provided"
  expect(move_pupil_page.error_message.text).to eql "No target school provided"
end

When(/^I attempt to move a pupil without entering a different target school$/) do
  pupil_summary_page.move_pupil.click
  move_pupil_page.target_school_urn.set move_pupil_page.urn.text
  move_pupil_page.confirm.click
end

Then(/^I should see an error stating target school has to be a different school$/) do
  expect(move_pupil_page.error_summary.text).to eql "Target school is the existing school!"
  expect(move_pupil_page.error_message.text).to eql "Target school is the existing school!"
end

When(/^I attempt to move a pupil entering a school that does not exist$/) do
  pupil_summary_page.move_pupil.click
  move_pupil_page.target_school_urn.set '00000'
  move_pupil_page.confirm.click
end

Then(/^I should see an error stating target school does not exist$/) do
  expect(move_pupil_page.error_summary.text).to eql "Error retrieving school: School not found for URN [00000]"
  expect(move_pupil_page.error_message.text).to eql "Error retrieving school: School not found for URN [00000]"
end


When(/^I attempt to move a pupil using a upn that contains a letter$/) do
  array_of_urns = SqlDbHelper.list_all_schools.map {|school| school['urn']}
  current_urn = move_pupil_page.urn.text.to_i
  array_of_urns.delete current_urn
  target_urn = array_of_urns.sample
  pupil_summary_page.move_pupil.click
  move_pupil_page.target_school_urn.set "#{target_urn}a"
  move_pupil_page.confirm.click
end


Then(/^I should see an error stating the urn is invalid$/) do
  expect(move_pupil_page.error_summary.text).to eql "Error retrieving school: Validation failed for parameter 'urn'. Invalid number."
  expect(move_pupil_page.error_message.text).to eql "Error retrieving school: Validation failed for parameter 'urn'. Invalid number."
end
