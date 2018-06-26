Given(/^I am on the Pupil Register page$/) do
  pupil_register_page.load
end

Then(/^I should see on Pupil register page that all the pupils who are registered are displayed and sorted by lastname$/) do
  pupils_from_page = pupil_register_page.pupil_list.pupil_row.map {|x| x.names.text}
  sorted_pupils_from_page = pupil_register_page.pupil_list.pupil_row.map {|x| x.names.text}.sort
  expect(sorted_pupils_from_page).to match_array(pupils_from_page)
end

Then(/^I should see on the Pupil Register page that all pupils are displayed in descending order of lastname$/) do
  pupils_from_page = pupil_register_page.pupil_list.pupil_row.map {|x| x.names.text}
  sorted_pupils_from_page = pupil_register_page.pupil_list.pupil_row.map {|x| x.names.text}.sort.reverse
  expect(sorted_pupils_from_page).to match_array(pupils_from_page)
end

When(/^I click the Add Pupils link from Pupil Register page$/) do
  pupil_register_page.add_pupil.click
end

When(/^I click on the Name heading$/) do
  pupil_register_page.pupil_list_column_heading.name_heading.click
end

And(/^I should see the added pupil details on the pupil register page$/) do
  pupil_register_page.load
  pupil_list = pupil_register_page.pupil_list.pupil_row.map {|x| x.names.text}
  expect(pupil_list).to include(@details_hash[:last_name] + ', ' + @details_hash[:first_name])
end

And(/^I should see the updated pupil details on the pupil register page$/) do
  pupil_register_page.load
  pupil_list = pupil_register_page.pupil_list.pupil_row.map {|x| x.names.text}
  expect(pupil_list).to include(@updated_details_hash[:last_name] + ', ' + @updated_details_hash[:first_name])
end

And(/^I choose to add a pupil by clicking Add Pupils link$/) do
  pupil_register_page.add_pupil.click
  pupil_name = (0...8).map {(65 + rand(26)).chr}.join
  step "I am on the add pupil page"
  step "I submit the form with the name fields set as #{pupil_name}"
end

And(/^I choose to edit the first pupil in the list$/) do
  pupil_register_page.pupil_list.pupil_row.first.edit_pupil_link.click
end

Then(/^I can see the status for the pupil is '(.*)'$/) do |status|
  pupil_row = pupil_register_page.find_pupil_row(@details_hash[:first_name])
  expect(pupil_row.result.text).to eql(status)
end

Then(/^I can see the status for the pupil is '(.*)' for pupil not taking the check$/) do |status|
  pupil_row = pupil_register_page.find_pupil_row(@pupil['lastName'])
  expect(pupil_row.result.text).to eql(status)
end

Then(/^I should see each pupil row have the group coloumn populated with the group name$/) do
  pupils_with_group = pupil_register_page.pupil_list.pupil_row.map! {|row| row.names.text.split(' Date')[0] if row.group.text == @group_name}.compact
  expect(pupils_with_group.sort.size).to eql @pupil_group_array.sort.size
end

Then(/^any pupils not part of a group should not have an entry for group$/) do
  pupils_with_no_group = pupil_register_page.pupil_list.pupil_row.map! {|row| row.names.text if row.group.text != @group_name}.compact
  empty_group_value = pupil_register_page.pupil_list.pupil_row.map! {|row|row.names.text if  row.group.text == '-'}.compact
  expect(pupils_with_no_group).to eql empty_group_value
end