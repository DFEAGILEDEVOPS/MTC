
Given(/^I navigate to access arrangements page$/) do
  school_landing_page.access_arrangements.click
end

Then(/^the access arrangements page is displayed as per the design$/) do
  expect(access_arrangements_page).to have_heading
  expect(access_arrangements_page).to have_information
  expect(access_arrangements_page).to have_select_pupil_and_arrangement_btn
  expect(access_arrangements_page).to have_retro_input

end

Given(/^I am on the select access arrangements page$/) do
  step 'I am logged in'
  school_landing_page.access_arrangements.click
  access_arrangements_page.select_pupil_and_arrangement_btn.click
end

Then(/^I should see the select access arrangements page matches design$/) do
  expected_list = SqlDbHelper.access_arrangements.map{|a| a['description']}
  actual_list = select_access_arrangements_page.access_arrangements.row.map {|a| a.arrangement_name.text.split(' (')[0]}
  expect(actual_list).to eql expected_list.sort
  expect(select_access_arrangements_page).to have_drop_down
  expect(select_access_arrangements_page).to have_save
  expect(select_access_arrangements_page).to have_cancel
  expect(select_access_arrangements_page).to have_back_to_top
end

When(/^I search for pupil '(.*)'$/) do |pupil_search|
  select_access_arrangements_page.search_pupil.set(pupil_search)
end

Then(/^I can see auto search list$/) do
  expect(select_access_arrangements_page.auto_search_list.count > 0).to be_truthy, "Actual count of the auto serach suggestion is #{select_access_arrangements_page.auto_search_list.count}"
end

Then(/^I can see the pupil returned in auto search list$/) do
  actual_pupil_returned =select_access_arrangements_page.auto_search_list[0].text
  expect(actual_pupil_returned.include?(@details_hash[:first_name])). to be_truthy, "Search result Expected: #{@details_hash[:first_name]}...But actual : #{actual_pupil_returned} "
end

Given(/^I search for the pupil for access arrangement$/) do
  name = (0...8).map {(65 + rand(26)).chr}.join
  step "I am logged in"
  step "I am on the add pupil page"
  step "I submit the form with the name fields set as #{name}"
  access_arrangements_page.load
  access_arrangements_page.select_pupil_and_arrangement_btn.click

  step "I search for pupil '#{@details_hash[:first_name]}'"
end

Given(/^I have selected access arrangement '(.*)' for a pupil$/) do |access_arrangement_type|
  step "I search for the pupil for access arrangement"
  select_access_arrangements_page.auto_search_list[0].click
  select_access_arrangements_page.select_access_arrangement(access_arrangement_type)
  select_access_arrangements_page.save.click
end

When(/^I save access arrangements without selecting pupil$/) do
  select_access_arrangements_page.select_access_arrangement("Audible time alert")
  select_access_arrangements_page.save.click
end

When(/^I save access arrangements without selecting any access arrangements$/) do
  select_access_arrangements_page.search_pupil.set(@details_hash[:first_name])
  select_access_arrangements_page.auto_search_list[0].click
  select_access_arrangements_page.save.click
end

When(/^I save access arrangements without providing explanation for input assistance$/) do
  select_access_arrangements_page.search_pupil.set(@details_hash[:first_name])
  select_access_arrangements_page.auto_search_list[0].click
  select_access_arrangements_page.select_access_arrangement("Input assistance (reason and input assistant's name required)")
  select_access_arrangements_page.save.click
end

When(/^I save access arrangements without providing explanation for next between questions$/) do
  select_access_arrangements_page.search_pupil.set(@details_hash[:first_name])
  select_access_arrangements_page.auto_search_list[0].click
  select_access_arrangements_page.select_access_arrangement("Pause - 'next' button between questions")
  select_access_arrangements_page.save.click
end

When(/^I save access arrangements without selecting any question reader reason$/) do
  select_access_arrangements_page.search_pupil.set(@details_hash[:first_name])
  select_access_arrangements_page.auto_search_list[0].click
  select_access_arrangements_page.select_access_arrangement("Audio version (reason required)")
  select_access_arrangements_page.save.click
end

When(/^I save access arrangements without providing explanation for other reason for question reader$/) do
  select_access_arrangements_page.search_pupil.set(@details_hash[:first_name])
  select_access_arrangements_page.auto_search_list[0].click
  select_access_arrangements_page.select_access_arrangement("Audio version (reason required)")
  question_reader_access_arrangement_row =select_access_arrangements_page.find_access_arrangement_row("Audio version (reason required)")
  question_reader_access_arrangement_row.question_reader_reason[3].question_reader_reason_radio.click
  select_access_arrangements_page.save.click
end

Then(/^I can see the error message for access arrangmenets '(.*)'$/) do |error_message|
  expect(select_access_arrangements_page).to have_error_summary
  expect(select_access_arrangements_page.error_summary).to have_error_heading
  expect(select_access_arrangements_page.error_summary).to have_error_info
  expect(select_access_arrangements_page.error_summary.error_text.text.eql?(error_message)). to be_truthy, "Expected: #{error_message}....but Got Actual: #{select_access_arrangements_page.error_summary.error_text.text}"
end

Then(/^I can see the pupil in the access arrangment pupil list with access arrangment type '(.*)'$/) do |access_arrangement_type|
  expect(access_arrangements_page.success_message.text.eql?("Access arrangements applied to #{@details_hash[:last_name]}, #{@details_hash[:first_name]}")).to be_truthy, "Actual info message is : #{access_arrangements_page.success_message.text}"
  hightlighted_row = access_arrangements_page.pupil_list.rows.find {|row| row.has_highlighted_pupil?}
  expect(hightlighted_row.pupil_name.text).to include("#{@details_hash[:last_name]}, #{@details_hash[:first_name]}")
  expect(hightlighted_row.access_arrangement_name.first.text).to include(access_arrangement_type)
end

Given(/^I have added a pupil with an access arrangement$/) do
  step 'I am on the select access arrangements page'
  @pupil_name = "#{@details_hash[:last_name]}, #{@details_hash[:first_name]}"
  select_access_arrangements_page.search_pupil.set(@pupil_name.gsub(',', ''))
  select_access_arrangements_page.auto_search_list[0].click
  @access_arrangement_name = "Audible time alert"
  select_access_arrangements_page.select_access_arrangement(@access_arrangement_name)
  select_access_arrangements_page.save.click
end

When(/^I select the pupil to edit the access arrangement$/) do
  pupil_row = access_arrangements_page.find_pupil_row(@pupil_name)
  pupil_row.pupil_name.click
end

Then(/^the page should match design$/) do
  expect(select_access_arrangements_page).to have_pupil_name
  expect(select_access_arrangements_page.pupil_name.text).to eql "For #{@pupil_name}"
end

Then(/^I should be able to change the pupils access arrangements$/) do
  pupil_id = SqlDbHelper.pupil_details_using_names(@pupil_name.split(',').last.strip,@pupil_name.split(',').first.strip, @school_id)['id']
  current_aa = SqlDbHelper.get_access_arrangements_for_a_pupil(pupil_id).map {|aa| aa['accessArrangements_id']}
  select_access_arrangements_page.select_access_arrangement(@access_arrangement_name)
  @new_access_arrangement_name = "Remove on-screen number pad"
  select_access_arrangements_page.select_access_arrangement(@new_access_arrangement_name)
  select_access_arrangements_page.save.click
  new_aa = SqlDbHelper.get_access_arrangements_for_a_pupil(pupil_id).map {|aa| aa['accessArrangements_id']}
  expect(new_aa).to_not eql current_aa
end

Given(/^I have a pupil who needs all possible access arrangements$/) do
  step 'I am on the select access arrangements page'
  @pupil_name = "#{@details_hash[:last_name]}, #{@details_hash[:first_name]}"
  select_access_arrangements_page.search_pupil.set(@pupil_name.gsub(',', ''))
  select_access_arrangements_page.auto_search_list[0].click
  SqlDbHelper.access_arrangements.map{|a| a['description']}.each do |aa|
    select_access_arrangements_page.select_access_arrangement(aa) unless aa == 'Retrospective Input assistance'
  end
  question_reader_row =select_access_arrangements_page.find_access_arrangement_row("Audio version (reason required)")
  question_reader_row.question_reader_reason[2].question_reader_reason_radio.click
  select_access_arrangements_page.save.click
end

Then(/^the arrangements should be listed against the pupil$/) do
  pupil_row = access_arrangements_page.find_pupil_row(@pupil_name)
  aa_array = SqlDbHelper.access_arrangements.map{|a| a['description'].gsub('(reason required)','').strip unless a['description'] == "Retrospective Input assistance"}.compact
  expect(aa_array.sort).to eql pupil_row.access_arrangement_name.map{|a| a.text}
end

And(/^I add a new access arrangement$/) do
  @new_access_arrangement_name = "Remove on-screen number pad"
  select_access_arrangements_page.select_access_arrangement(@new_access_arrangement_name)
end

But(/^I decide to cancel any update$/) do
  select_access_arrangements_page.cancel.click
end

Then(/^I should see no changes made to the pupils access arrangements$/) do
  pupil_row = access_arrangements_page.find_pupil_row(@pupil_name)
  expect(@access_arrangement_name).to eql pupil_row.access_arrangement_name.map{|a| a.text}.first
end

When(/^I want to remove all access arrangement for a pupil/) do
  pupil_row = access_arrangements_page.find_pupil_row(@details_hash[:first_name])
  @pupil_access_arrangements = pupil_row.access_arrangement_name.map {|aa| aa.text}
  pupil_row.edit.click
  select_access_arrangements_page.uncheck_all_pupils_access_arrangements(@pupil_access_arrangements)
  select_access_arrangements_page.save.click
end

When(/^I removed all access arrangement for a pupil$/) do
  pupil_row = access_arrangements_page.find_pupil_row(@details_hash[:first_name])
  @pupil_access_arrangements = pupil_row.access_arrangement_name.map {|aa| aa.text}
  pupil_row.edit.click
  select_access_arrangements_page.uncheck_all_pupils_access_arrangements(@pupil_access_arrangements)
  select_access_arrangements_page.save.click
  select_access_arrangements_page.modal.confirm.click
end

When(/^I decided to select no from the modal to remove access arrangment$/) do
  pupil_row = access_arrangements_page.find_pupil_row(@details_hash[:first_name])
  @pupil_access_arrangements = pupil_row.access_arrangement_name.map {|aa| aa.text}
  pupil_row.edit.click
  select_access_arrangements_page.uncheck_all_pupils_access_arrangements(@pupil_access_arrangements)
  select_access_arrangements_page.save.click
  select_access_arrangements_page.modal.cancel.click
  select_access_arrangements_page.cancel.click
end

Then(/^modal to remove access arrangements is displayed as per the design$/) do
  expect(select_access_arrangements_page.modal).to have_heading
  expect(select_access_arrangements_page.modal.heading.text).to eql 'Remove arrangements'

  expect(select_access_arrangements_page.modal).to have_contents
  expect(select_access_arrangements_page.modal.contents.text).to eql 'Are you sure you want to remove all access arrangements for this pupil?'

  expect(select_access_arrangements_page.modal).to have_cancel
  expect(select_access_arrangements_page.modal).to have_confirm
end

Then(/^the pupil is removed from the access arrangmenet pupil list$/) do
  expect(access_arrangements_page.success_message.text.eql?("Access arrangements removed for #{@details_hash[:last_name]}, #{@details_hash[:first_name]}"))
  pupils_from_page = access_arrangements_page.pupil_list.rows.map {|x| x.text} if access_arrangements_page.has_pupil_list?
  expect(pupils_from_page.include?(@details_hash[:first_name])).to be_falsy, "#{@details_hash[:first_name]} is displayed in the list ... Expected - It Shouldn't" if access_arrangements_page.has_pupil_list?
  expect(access_arrangements_page).to have_no_pupils_message unless access_arrangements_page.has_pupil_list?
end

Then(/^the pupil is not removed from the access arrangmenet pupil list$/) do
  pupils_from_page = access_arrangements_page.pupil_list.rows.map {|x| x.text}
  expect(pupils_from_page.join.include?(@details_hash[:first_name])).to be_truthy, "#{@details_hash[:first_name]} is not displayed in the list ... Expected - It Should"
end

When(/^I decide against removing access arrangements against a pupil$/) do
  step 'I select the pupil to edit the access arrangement'
  select_access_arrangements_page.select_access_arrangement(@access_arrangement_name)
  select_access_arrangements_page.save.click
  select_access_arrangements_page.modal.cancel.click
end

Then(/^there should be no change made to the pupils access arrangements$/) do
  pupil_id = SqlDbHelper.pupil_details_using_names(@pupil_name.split(',').last.strip,@pupil_name.split(',').first.strip, @school_id)['id']
  aa_id = SqlDbHelper.get_access_arrangements_for_a_pupil(pupil_id).first['accessArrangements_id']
  aa_description = SqlDbHelper.find_access_arrangements_by_id(aa_id).first['description']
  expect(@access_arrangement_name).to eql aa_description
end

Then(/^I should be able to remove any access arrangements for the pupil from the edit page$/) do
  step 'I select the pupil to edit the access arrangement'
  select_access_arrangements_page.select_access_arrangement(@access_arrangement_name)
  select_access_arrangements_page.save.click
  select_access_arrangements_page.modal.confirm.click
  expect(access_arrangements_page.success_message.text).to eql "Access arrangements removed for #{@pupil_name}"
end


And(/^I have applied the (.+) access arrangement to the pupil$/) do |access_arrangement_type|
  access_arrangements_page.load
  access_arrangements_page.select_pupil_and_arrangement_btn.click
  step "I search for pupil '#{@details_hash[:first_name]}'"
  select_access_arrangements_page.auto_search_list[0].click
  select_access_arrangements_page.select_access_arrangement(access_arrangement_type)
  select_access_arrangements_page.save.click
  @first_aa = access_arrangement_type
end

And(/^I decide to update the pupils access arrangements by adding (.+)$/) do |access_arrangement_type|
  access_arrangements_page.load
  pupil_row = access_arrangements_page.find_pupil_row(@pupil_name)
  pupil_row.pupil_name.click
  select_access_arrangements_page.select_access_arrangement(access_arrangement_type)
  select_access_arrangements_page.save.click
  @second_aa = access_arrangement_type
end

And(/^these updates should be saved in the DB$/) do
  pupil_id = SqlDbHelper.pupil_details(@details_hash[:upn], @school_id)['id']
  pupil_access_arrangements = SqlDbHelper.get_access_arrangements_for_a_pupil(pupil_id)
  access_id_array = pupil_access_arrangements.map {|a| a['accessArrangements_id']}
  expect(access_id_array.size).to eql 2
  aa_descriptions = access_id_array.map {|aa_id| SqlDbHelper.find_access_arrangements_by_id(aa_id).first['description']}
  expect(aa_descriptions.sort).to eql [@first_aa, @second_aa].sort
end
