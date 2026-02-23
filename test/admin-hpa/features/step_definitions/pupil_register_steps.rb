Given(/^I am on the Pupil Register page$/) do
  pupil_register_page.load
end

Then(/^I should see on Pupil register page that all the pupils who are registered are displayed and sorted by lastname$/) do
  pupils_from_page = pupil_register_page.pupil_list.pupil_row.map { |x| x.names.text }
  sorted_pupils_from_page = pupil_register_page.pupil_list.pupil_row.map { |x| x.names.text }.sort
  expect(sorted_pupils_from_page).to match_array(pupils_from_page)
end

Then(/^I should see on the Pupil Register page that all pupils are displayed in descending order of lastname$/) do
  pupils_from_page = pupil_register_page.pupil_list.pupil_row.map { |x| x.names.text }
  sorted_pupils_from_page = pupil_register_page.pupil_list.pupil_row.map { |x| x.names.text }.sort.reverse
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
  pupil_list = pupil_register_page.pupil_list.pupil_row.map { |x| x.names.text }
  expect(pupil_list).to include(@details_hash[:last_name] + ', ' + @details_hash[:first_name])
end

And(/^I should see the updated pupil details on the pupil register page$/) do
  pupil_register_page.load
  pupil_list = pupil_register_page.pupil_list.pupil_row.map { |x| x.names.text }
  expect(pupil_list).to include(@updated_details_hash[:last_name] + ', ' + @updated_details_hash[:first_name])
end

And(/^I choose to add a pupil by clicking Add Pupils link$/) do
  pupil_register_page.add_pupil.click
  pupil_name = (0...8).map { (65 + rand(26)).chr }.join
  step "I am on the add pupil page"
  step "I submit the form with the name fields set as #{pupil_name}"
end

And(/^I choose to edit the first pupil in the list$/) do
  pupil_register_page.pupil_list.pupil_row.first.edit_pupil_link.click
end

Then(/^I can see the status for the pupil is '(.*)'$/) do |status|
  unless status == 'Not started' || status == "Overdue - signed in check not started"
    Timeout.timeout(ENV['WAIT_TIME'].to_i) { sleep 1 until SqlDbHelper.check_details(SqlDbHelper.pupil_details(@details_hash[:upn], @school_id)['id'])['complete'] } unless status == 'Error in processing' || status == 'Pupil check not received' || status == 'Signed in'
    Timeout.timeout(ENV['WAIT_TIME'].to_i) { sleep 1 until SqlDbHelper.check_details(SqlDbHelper.pupil_details(@details_hash[:upn], @school_id)['id'])['processingFailed'] } if status == 'Error in processing'
    Timeout.timeout(ENV['WAIT_TIME'].to_i) { sleep 1 until (SqlDbHelper.check_details(SqlDbHelper.pupil_details(@details_hash[:upn], @school_id)['id'])['pupilLoginDate']).is_a?(Time) } if status == 'Signed in'
  end
  # status == 'Restart applied' ? status = 'Not started' : status = status
  sleep 3
  pupil_status_page.load

  Timeout.timeout(ENV['WAIT_TIME'].to_i) { pupil_status_page.load until pupil_status_page.find_status_for_pupil(status, @details_hash[:first_name]) }
  pupil_row = pupil_status_page.find_status_for_pupil(status, @details_hash[:first_name])
  expect(pupil_row.status.text).to include status
end

Then(/^I can see the status for the pupil is (.*) for pupil not taking the check$/) do |status|
  Timeout.timeout(20) { pupil_status_page.pupils_completed.count.click until pupil_status_page.pupils_completed_details.pupil_list.visible? }
  pupil_row = pupil_status_page.pupils_completed_details.pupil_list.pupil_row.find { |r| r.text.include? @pupil['lastName'] }
  expect(pupil_row.status.text).to include status
end

Then(/^I should see each pupil row have the group column populated with the group name$/) do
  pupils_with_group = pupil_register_page.pupil_list.pupil_row.map! { |row| row.text if row.text.include? @group_name }.compact
  expect(pupils_with_group.sort.size).to eql @pupil_group_array.sort.size
end

Then(/^any pupils not part of a group should not have an entry for group$/) do
  pupils_with_no_group = pupil_register_page.pupil_list.pupil_row.map! { |row| row.text if !row.text.include? @group_name }.compact
  empty_group_value = pupil_register_page.pupil_list.pupil_row.map! { |row| row.text if row.text.include? '-' }.compact
  expect(pupils_with_no_group).to eql empty_group_value
end

Then(/^these pupils should be highlighted in red$/) do
  Timeout.timeout(ENV['WAIT_TIME'].to_i) { visit current_url until pupil_register_page.find_pupil_row(@pupil_name).has_incomplete_pupil? }
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
  pupils_from_register = pupil_register_page.pupil_list.pupil_row.map { |x| x.names.text.split("\n")[0] }
  wait_until {!(REDIS_CLIENT.get("pupilRegisterViewData:#{@school_id}")).nil?}
  pupils_from_redis = (JSON.parse(JSON.parse(REDIS_CLIENT.get("pupilRegisterViewData:#{@school_id}"))['value'])).map { |x| x['fullName'] }
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
  pupil_row = pupil_register_page.pupil_list.pupil_row.select { |pupil| pupil.text != '' }
  expect(pupil_row.size).to eql 1
  expect(pupil_row.first.names.text).to eql "#{pupil['lastName']}, #{pupil['foreName']}"
end

Then(/^I can search for a pupil via upn$/) do
  pupil = SqlDbHelper.pupil_details_using_school(@upns_for_school.sample, @school_id)
  pupil_register_page.pupil_filter.set pupil['upn']
  pupil_row = pupil_register_page.pupil_list.pupil_row.select { |pupil| pupil.text != '' }
  expect(pupil_row.size).to eql 1
  expect(pupil_row.first.names.text).to eql "#{pupil['lastName']}, #{pupil['foreName']}"
end

And(/^I choose to show the (.+) column$/) do |column_name|
  pupil_register_page.select_optional_column(column_name)
end

Then(/^the optional columns along with the additional pupil info is added to the register table$/) do
  register_array = pupil_register_page.pupil_list.pupil_row.map { |row| { name: row.names.text, dob: row.dob.text, upn: row.upn.text, group: row.group.text } }
  db_pupil_array = SqlDbHelper.list_of_pupils_from_school(@school_id).map { |row| { name: row['foreName'] + ", " + row['foreName'], dob: row['dateOfBirth'].strftime("%-d %b %Y"), upn: row['upn'], group: (row['group_id'].nil? ? '-' : @group_name) } }.sort_by { |hsh| hsh[:name] }
  expect(db_pupil_array).to eql register_array
end

And(/^I am on the Pupil Register page with optional fields displayed$/) do
  step 'I am on the Pupil Register page'
  step 'I choose to show the Group column'
  step 'I choose to show the UPN column'
end

And(/^I choose to sort the pupil register by name in reverse order$/) do
  pupil_register_page.pupil_list.pupil_header.click
end

Then(/^the pupil register is sorted by name in reverse order$/) do
  register_array = pupil_register_page.pupil_list.pupil_row.map { |row| { name: row.names.text, dob: row.dob.text, upn: row.upn.text, group: row.group.text } }
  db_pupil_array = SqlDbHelper.list_of_pupils_from_school(@school_id).map { |row| { name: row['foreName'] + ", " + row['foreName'], dob: row['dateOfBirth'].strftime("%-d %b %Y"), upn: row['upn'], group: (row['group_id'].nil? ? '-' : @group_name) } }.sort_by { |hsh| hsh[:name] }.reverse
  expect(db_pupil_array).to eql register_array
end

And(/^I choose to sort the pupil register by dob in order of oldest to newest$/) do
  pupil_register_page.pupil_list.dob_header.click
end

Then(/^the pupil register is sorted by dob in order of oldest to newest$/) do
  register_array = pupil_register_page.pupil_list.pupil_row.map { |row| { name: row.names.text, dob: row.dob.text, upn: row.upn.text, group: row.group.text } }
  db_pupil_array = SqlDbHelper.list_of_pupils_from_school(@school_id).map { |row| { name: row['foreName'] + ", " + row['foreName'], dob: row['dateOfBirth'].strftime("%-d %b %Y"), upn: row['upn'], group: (row['group_id'].nil? ? '-' : @group_name) } }.sort_by { |hsh| hsh[:dob] }.reverse
  expect(db_pupil_array.map {|p| p[:dob]}).to eql register_array.map {|p| p[:dob]}
end

And(/^I choose to sort the pupil register by dob in order of newest to oldest$/) do
  pupil_register_page.pupil_list.dob_header.click
  pupil_register_page.pupil_list.dob_header.click
end

Then(/^the pupil register is sorted by dob in order of newest to oldest$/) do
  register_array = pupil_register_page.pupil_list.pupil_row.map { |row| { name: row.names.text, dob: row.dob.text, upn: row.upn.text, group: row.group.text } }
  db_pupil_array = SqlDbHelper.list_of_pupils_from_school(@school_id).map { |row| { name: row['foreName'] + ", " + row['foreName'], dob: row['dateOfBirth'].strftime("%-d %b %Y"), upn: row['upn'], group: (row['group_id'].nil? ? '-' : @group_name) } }.sort_by { |hsh| hsh[:dob] }
  expect(db_pupil_array.map {|p| p[:dob]}).to eql register_array.map {|p| p[:dob]}
end

And(/^I choose to sort the pupil register by upn in z\-a order$/) do
  pupil_register_page.pupil_list.upn_header.click
end

Then(/^the pupil register is sorted by upn in z\-a order$/) do
  register_array = pupil_register_page.pupil_list.pupil_row.map { |row| { name: row.names.text, dob: row.dob.text, upn: row.upn.text, group: row.group.text } }
  db_pupil_array = SqlDbHelper.list_of_pupils_from_school(@school_id).map { |row| { name: row['foreName'] + ", " + row['foreName'], dob: row['dateOfBirth'].strftime("%-d %b %Y"), upn: row['upn'], group: (row['group_id'].nil? ? '-' : @group_name) } }.sort_by { |hsh| hsh[:upn] }.reverse
  expect(db_pupil_array).to eql register_array
end

And(/^I choose to sort the pupil register by upn in a\-z order$/) do
  pupil_register_page.pupil_list.upn_header.click
  pupil_register_page.pupil_list.upn_header.click
end

Then(/^the pupil register is sorted by upn in a\-z order$/) do
  register_array = pupil_register_page.pupil_list.pupil_row.map { |row| { name: row.names.text, dob: row.dob.text, upn: row.upn.text, group: row.group.text } }
  db_pupil_array = SqlDbHelper.list_of_pupils_from_school(@school_id).map { |row| { name: row['foreName'] + ", " + row['foreName'], dob: row['dateOfBirth'].strftime("%-d %b %Y"), upn: row['upn'], group: (row['group_id'].nil? ? '-' : @group_name) } }.sort_by { |hsh| hsh[:upn] }
  expect(db_pupil_array).to eql register_array
end

Given(/^I have pupils in (\d+) groups$/) do |arg|
  step 'I have a group of pupils'
  add_edit_groups_page.load(add_or_edit: 'add')
  add_edit_groups_page.group_name.set @group_name + 'new'
  add_edit_groups_page.select_all_pupils.click
  add_edit_groups_page.sticky_banner.confirm.click
end

And(/^I choose to sort the pupil register by group in z\-a order$/) do
  pupil_register_page.pupil_list.group_header.click
end

Then(/^the pupil register is sorted by group in z\-a order$/) do
  register_array = pupil_register_page.pupil_list.pupil_row.map { |row| { name: row.names.text, dob: row.dob.text, upn: row.upn.text, group: row.group.text } }
  db_pupil_array = SqlDbHelper.list_of_pupils_from_school(@school_id).map { |row| { name: row['foreName'] + ", " + row['foreName'], dob: row['dateOfBirth'].strftime("%-d %b %Y"), upn: row['upn'], group: (row['group_id'].nil? ? '-' : SqlDbHelper.group_details(SqlDbHelper.pupil_details(row['upn'], @school_id)['group_id'])['name']) } }.sort_by { |hsh| hsh[:group] }.reverse
  expect(db_pupil_array.map {|p| p[:group]}).to eql register_array.map {|p| p[:group]}
end

And(/^I choose to sort the pupil register by group in a\-z order$/) do
  pupil_register_page.pupil_list.group_header.click
  pupil_register_page.pupil_list.group_header.click
end

Then(/^the pupil register is sorted by group in a\-z order$/) do
  register_array = pupil_register_page.pupil_list.pupil_row.map { |row| { name: row.names.text, dob: row.dob.text, upn: row.upn.text, group: row.group.text } }
  db_pupil_array = SqlDbHelper.list_of_pupils_from_school(@school_id).map { |row| { name: row['foreName'] + ", " + row['foreName'], dob: row['dateOfBirth'].strftime("%-d %b %Y"), upn: row['upn'], group: (row['group_id'].nil? ? '-' : SqlDbHelper.group_details(SqlDbHelper.pupil_details(row['upn'], @school_id)['group_id'])['name']) } }.sort_by { |hsh| hsh[:group] }
  expect(db_pupil_array.map {|p| p[:group]}).to eql register_array.map {|p| p[:group]}
end

Then(/^I can choose to hide the Group column$/) do
  expect(pupil_register_page.pupil_list.group_header).to be_visible
  pupil_register_page.optional_columns.optional_columns_text.click if !pupil_register_page.optional_columns.upn_label.visible?
  pupil_register_page.optional_columns.group.click
  expect(pupil_register_page.pupil_list.group_header).to_not be_visible
end
