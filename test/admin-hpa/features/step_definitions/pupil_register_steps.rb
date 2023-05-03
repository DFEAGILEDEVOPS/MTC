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
  unless status == 'Not started'
    SafeTimeout.timeout(ENV['WAIT_TIME'].to_i) {sleep 1 until SqlDbHelper.check_details(SqlDbHelper.pupil_details(@details_hash[:upn], @school_id)['id'])['complete']} unless status == 'Error in processing' || status == 'Pupil check not received'
    SafeTimeout.timeout(ENV['WAIT_TIME'].to_i) {sleep 1 until SqlDbHelper.check_details(SqlDbHelper.pupil_details(@details_hash[:upn], @school_id)['id'])['processingFailed']} if status == 'Error in processing'
  end
  status == 'Restart' ? status = 'Not started' : status = status
  pupil_status_page.load
  SafeTimeout.timeout(ENV['WAIT_TIME'].to_i) {pupil_status_page.load until pupil_status_page.find_status_for_pupil(status, @details_hash[:first_name])}
  pupil_row = pupil_status_page.find_status_for_pupil(status, @details_hash[:first_name])
  expect(pupil_row.status.text).to include status
end

Then(/^I can see the status for the pupil is (.*) for pupil not taking the check$/) do |status|
  SafeTimeout.timeout(20) {pupil_status_page.not_taking_checks.count.click until pupil_status_page.not_taking_checks_details.pupil_list.visible?}
  pupil_row = pupil_status_page.not_taking_checks_details.pupil_list.pupil_row.find {|r| r.text.include? @pupil['lastName']}
  expect(pupil_row.status.text).to include status
end

Then(/^I should see each pupil row have the group coloumn populated with the group name$/) do
  pupils_with_group = pupil_register_page.pupil_list.pupil_row.map! {|row| row.names.text.split(' Date')[0] if row.group.text == @group_name}.compact
  expect(pupils_with_group.sort.size).to eql @pupil_group_array.sort.size
end

Then(/^any pupils not part of a group should not have an entry for group$/) do
  pupils_with_no_group = pupil_register_page.pupil_list.pupil_row.map! {|row| row.names.text if row.group.text != @group_name}.compact
  empty_group_value = pupil_register_page.pupil_list.pupil_row.map! {|row| row.names.text if row.group.text == '-'}.compact
  expect(pupils_with_no_group).to eql empty_group_value
end

Then(/^these pupils should be highlighted in red$/) do
  SafeTimeout.timeout(ENV['WAIT_TIME'].to_i) {visit current_url until pupil_register_page.find_pupil_row(@pupil_name).has_incomplete_pupil?}
  expect(pupil_register_page).to have_incomplete_message
  pupil_row = pupil_register_page.find_pupil_row(@pupil_name)
  expect(pupil_row).to have_incomplete_pupil
end


Then(/^I should see a toggle that explains each status$/) do
  expect(pupil_register_page).to have_pupil_status_explanation
end


Then(/^I should see a count of pupils in the school$/) do
  school_id = SqlDbHelper.find_teacher(@user)['school_id']
  db_count = SqlDbHelper.list_of_pupils_from_school(school_id).size
  expect(pupil_register_page.pupil_list.pupil_count.text).to eql "List of available pupils (#{db_count})"
end


Then(/^I should see the pupil register data stored in redis$/) do
  pupils_from_register = pupil_register_page.pupil_list.pupil_row.map {|x| x.names.text.split("\n")[0]}
  pupils_from_redis = (JSON.parse(JSON.parse(REDIS_CLIENT.get('pupilRegisterViewData:2'))['value'])).map {|x| x['fullName']}
  expect(pupils_from_redis.sort).to eql pupils_from_register.sort
end


Given(/^I have a pupil not taking the check with the reason (.*)$/) do |reason|
  step 'I am on the pupil reason page for new pupil'
  step "I add #{reason} as a reason for a particular pupil"
  step "the #{reason} reason should be stored against the pupils"
  sleep 3
end


Then(/^I can search for a pupil via name$/) do
  pupil = SqlDbHelper.pupil_details_using_school(@upns_for_school.sample, @school_id)
  pupil_register_page.pupil_filter.set "#{pupil['foreName'][0] + pupil['foreName'][1] + pupil['foreName'][2]}"
  pupil_row = pupil_register_page.pupil_list.pupil_row.select {|pupil| pupil.text != ''}
  expect(pupil_row.size).to eql 1
  expect(pupil_row.first.names.text).to eql "#{pupil['lastName']}, #{pupil['foreName']}"
end

Then(/^I can search for a pupil via upn$/) do
  pupil = SqlDbHelper.pupil_details_using_school(@upns_for_school.sample, @school_id)
  pupil_register_page.pupil_filter.set pupil['upn']
  pupil_row = pupil_register_page.pupil_list.pupil_row.select {|pupil| pupil.text != ''}
  expect(pupil_row.size).to eql 1
  expect(pupil_row.first.names.text).to eql "#{pupil['lastName']}, #{pupil['foreName']}"
end
