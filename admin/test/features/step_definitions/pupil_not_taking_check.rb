Given(/^I am on the pupil not taking check page$/) do
  step 'I am logged in'
  pupils_not_taking_check_page.load
end

Then(/^I should see the heading$/) do
  expect(pupils_not_taking_check_page).to have_heading
end

Then(/^I should see the info text$/) do
  expect(pupils_not_taking_check_page).to have_info_text
end

Then(/^I should see a way to add a reason$/) do
  expect(pupils_not_taking_check_page).to have_add_reason
end

Then(/^I should be able to go back to the top$/) do
  expect(pupils_not_taking_check_page).to have_back_to_top
end

Then(/^I should see a way to generate pins$/) do
  expect(pupils_not_taking_check_page).to have_generate_pins
end

When(/^I want to add a reason$/) do
  pupils_not_taking_check_page.add_reason.click
  page.execute_script "window.scrollBy(0,500)"
end

Then(/^I should see a heading on the page$/) do
  expect(pupil_reason_page).to have_heading
end

Then(/^I should see set of reasons I can choose$/) do
  expected_reason_hash = SqlDbHelper.get_attendance_codes.map{|code| code['reason']}
  expect(pupil_reason_page.attendance_code_mapping.keys.sort).to eql pupil_reason_page.attendance_codes.map{|code| code['id']}.sort
  actual_reason_hash = pupil_reason_page.attendance_code_mapping.values
  expect(actual_reason_hash.sort).to eql expected_reason_hash.sort
end

Then(/^I should see a back to top option$/) do
  expect(pupil_reason_page).to have_back_to_top
end

Then(/^I should see a option to generate pins$/) do
  expect(pupil_reason_page).to have_generate_pins
end

Then(/^I should see a section that explains the reasons$/) do
  expect(pupil_reason_page.explanation_section).to be_all_there
end

When(/^I want to add a reason for pupils not taking a check$/) do
  pupils_not_taking_check_page.load
  pupils_not_taking_check_page.add_reason.click
  page.execute_script "window.scrollBy(0,500)"
end

Then(/^I should see a list of pupils sorted by surname$/) do
  school_id = SqlDbHelper.find_teacher(@teacher)['school_id']
  pupils_from_db = SqlDbHelper.list_of_pupils_from_school(school_id)
  expect(pupils_from_db.map {|pupil| pupil['lastName'] + ', ' + pupil['foreName']}.sort).to eql pupil_reason_page.pupil_list.rows.map {|t| t.name.text}
end

Given(/^I am on the pupil reason page$/) do
  step 'I am on the pupil not taking check page'
  step 'I want to add a reason'
  @page = pupil_reason_page
end

Then(/^I should be able to select them via a checkbox$/) do
  pupil_reason_page.pupil_list.rows.each {|pupil| expect(pupil).to have_checkbox}
end

Then(/^I should be able to sort them via their reason for absence$/) do
  fail 'not yet implemented'
end

Then(/^I should have a option to select all pupils$/) do
  expect(pupil_reason_page).to have_select_all_pupils
end


And(/^I want to sort the surnames in to desecending order$/) do
  pupil_reason_page.pupil_coloumn.click
end

Then(/^I should see a list of pupils sorted by surname in descending order$/) do
  school_id = SqlDbHelper.find_teacher(@teacher)['school_id']
  pupils_from_db = SqlDbHelper.list_of_pupils_from_school(school_id)
  expect(pupils_from_db.map {|pupil| pupil['lastName'] + ', ' + pupil['foreName']}.sort.reverse).to eql pupil_reason_page.pupil_list.rows.map {|t| t.name.text}
end

Then(/^I should see a sticky banner$/) do
  expect(@page.sticky_banner).to be_visible
  expect(@page.sticky_banner).to be_all_there
end

Given(/^I have selected some pupils$/) do
  step 'I am on the pupil reason page'
  pupils = pupil_reason_page.pupil_list.rows.select {|row| row.has_no_selected? && row.reason.text == 'N/A'}
  pupils[0..3].each {|pupil| pupil.checkbox.click}
end

Then(/^I should see the confirm button disabled$/) do
  expect(pupil_reason_page.sticky_banner.confirm).to be_disabled
end

When(/^I select a pupil$/) do
  pupil = pupil_reason_page.pupil_list.rows.find {|row| row.has_no_selected? && row.reason.text == 'N/A'}
  pupil.checkbox.click
end

When(/^I select all pupil for pupil not taking check$/) do
  pupil_reason_page.select_all_pupils.click
end

And(/^I select a reason$/) do
  pupil_reason_page.attendance_codes.first.click
end

Then(/^I should see the confirm button enabled$/) do
  expect(pupil_reason_page.sticky_banner.confirm.disabled?).to be_falsey
end

When(/^I choose to cancel$/) do
  @page.sticky_banner.cancel.click
end

Then(/^my selections are cleared$/) do
  expect(pupil_reason_page.pupil_list.rows.select {|row| row.has_selected?}).to be_empty
end

When(/^I add (.+) as a reason for a particular pupil$/) do |reason|
  pupil_reason_page.select_reason(reason)
  pupils = pupil_reason_page.pupil_list.rows.reject{|row| row.name.text.include? 'áàâãäåāæéèêēëíìîïī' or row.name.text.include? 'ÁÀÂÃÄÅĀÆÉÈÊĒËÍÌÎÏĪ'}
  @pupil_row = pupils.reject.find {|row| row.has_no_selected? && row.reason.text == 'N/A'}
  @pupil_forename = @pupil_row.name.text.split(',')[1].strip
  @pupil_lastname = @pupil_row.name.text.split(',')[0].strip
  @pupil_row.checkbox.click
  pupil_reason_page.sticky_banner.confirm.click
end

Then(/^the (.+) reason should be stored against the pupils$/) do |reason|
  teacher = pupils_not_taking_check_page.signed_in_as.text
  teacher.slice! 'Signed in as'
  @pupil = SqlDbHelper.find_pupil_from_school(@pupil_forename, SqlDbHelper.find_teacher(teacher.strip)['school_id'])
  pupil_attendance_code = SqlDbHelper.get_attendance_code_for_a_pupil(@pupil['id'])
  @attendance_code = SqlDbHelper.check_attendance_code(pupil_attendance_code['attendanceCode_id'])
  expect(@attendance_code['reason']).to eql reason
end

Then(/^I should be able to select the pupils name to check the check box$/) do
  pupil = pupil_reason_page.pupil_list.rows.find {|row| row.has_no_selected? && row.reason.text == 'N/A'}
  pupil.name.click
  expect(pupil).to have_selected
end

Then(/^I should be able to select all pupils$/) do
  pupil_reason_page.select_all_pupils.click
  pupil_reason_page.pupil_list.rows.each {|row| expect(row).to have_selected}
end

Then(/^I should be able to unselect all pupils$/) do
  step 'I should be able to select all pupils'
  pupil_reason_page.unselect_all_pupils.click
  pupil_reason_page.pupil_list.rows.each {|row| expect(row).to have_no_selected}
end

Then(/^I should be taken to the pupil not taking check page$/) do
  expect(pupils_not_taking_check_page).to be_displayed
end

And(/^I should see the updated pupil on the hub page$/) do
  expect(pupils_not_taking_check_page).to have_flash_message
  expect(pupils_not_taking_check_page.flash_message.text).to eql '1 reason updated'
  hightlighted_row = pupils_not_taking_check_page.pupil_list.rows.find {|row| row.has_highlight?}
  expect(hightlighted_row.text).to include("#{@pupil['lastName']}, #{@pupil[:foreName]}")
  expect(hightlighted_row.text).to include(@attendance_code['reason'])
end

When(/^I add (.+) as a reason for multiple pupils$/) do |reason|
  @reason = reason
  pupil_reason_page.select_reason(@reason)
  @pupils = pupil_reason_page.pupil_list.rows.select {|row| row.has_no_selected? && row.reason.text == 'N/A'}
  @pupils[0..3].each {|pupil| pupil.checkbox.click}
  @pupil_names = @pupils[0..3].map {|pupil| pupil.name.text}
  pupil_reason_page.sticky_banner.confirm.click
end

Then(/^the reason should be stored against the pupils$/) do
  teacher = pupils_not_taking_check_page.signed_in_as.text
  teacher.slice! 'Signed in as'
  @pupil_names.each do |name|
    pupil = SqlDbHelper.find_pupil_from_school(name.split(',')[1].strip, SqlDbHelper.find_teacher(teacher.strip)['school_id'])
    pupil_attendance_code = SqlDbHelper.get_attendance_code_for_a_pupil(pupil['id'])
    attendance_code = SqlDbHelper.check_attendance_code(pupil_attendance_code['attendanceCode_id'])
    expect(attendance_code['reason']).to eql @reason
  end
end

And(/^I should see the updated pupils on the hub page$/) do
  expect(pupils_not_taking_check_page).to have_flash_message
  expect(pupils_not_taking_check_page.flash_message.text).to eql "#{@pupils[0..3].count} reasons updated"
  hightlighted_rows = pupils_not_taking_check_page.pupil_list.rows.select {|row| row.has_highlight?}
  updated_names = hightlighted_rows.map {|row| row.text.split[0] + ' ' + row.text.split[1]}
  expect(updated_names).to eql @pupil_names
end

Given(/^I have previously added a reason for a pupil$/) do
  step 'I am on the pupil reason page'
  step 'I add Absent as a reason for a particular pupil'
  step 'the Absent reason should be stored against the pupils'
  step 'I should see the updated pupil on the hub page'
end

But(/^I decide to change it$/) do
  @updated_reason = 'Just arrived with EAL'
  pupils_not_taking_check_page.add_reason.click
  page.execute_script "window.scrollBy(0,500)"
  pupil_reason_page.select_reason(@updated_reason)
  pupil = pupil_reason_page.pupil_list.rows.find {|row| row.name.text.include? @pupil_forename}
  pupil.checkbox.click
  pupil_reason_page.sticky_banner.confirm.click
end

Then(/^the updated reason should be stored$/) do
  teacher = pupils_not_taking_check_page.signed_in_as.text
  teacher.slice! 'Signed in as'
  pupil = SqlDbHelper.find_pupil_from_school(@pupil_forename, SqlDbHelper.find_teacher(teacher.strip)['school_id'])
  pupil_attendance_code = SqlDbHelper.get_attendance_code_for_a_pupil(pupil['id'])
  @attendance_code = SqlDbHelper.check_attendance_code(pupil_attendance_code['attendanceCode_id'])
  expect(@attendance_code['reason']).to eql @updated_reason
end

When(/^I have navigated away and then return to the pupil not taking check page$/) do
  pupils_not_taking_check_page.home.click
  pupils_not_taking_check_page.load
end

Then(/^I should see a list of pupils$/) do
  expect(pupils_not_taking_check_page.pupil_list.rows.first.name.text).to eql (@pupil['lastName'] + ', ' + @pupil['foreName'])
end

And(/^I remove a pupil from the list of pupils not taking a check$/) do
  pupil_row = pupils_not_taking_check_page.pupil_list.rows.find {|row| row.name.text == (@pupil['lastName'] + ', ' + @pupil['foreName'])}
  pupil_row.remove.click
end

Then(/^the pupil should be removed and any attendance code cleared from the db against the pupil$/) do
  expect(pupils_not_taking_check_page.flash_message.text).to eql "Reason removed for #{@pupil['lastName'] + ', ' + @pupil['foreName']}"
  teacher = pupils_not_taking_check_page.signed_in_as.text
  teacher.slice! 'Signed in as'
  @pupil = SqlDbHelper.find_pupil_from_school(@pupil_forename, SqlDbHelper.find_teacher(teacher.strip)['school_id'])
  pupil_attendance_code = SqlDbHelper.get_attendance_code_for_a_pupil(@pupil['id'])
  expect(pupil_attendance_code).to be_nil
end

Then(/^I should see a message stating there are no pupils not taking the check$/) do
  expect(pupils_not_taking_check_page).to have_no_pupils_listed_message
end

Then(/^I should not see a sticky banner$/) do
  expect(pupil_reason_page.sticky_banner).to_not be_visible
end

When(/^I select multiple pupils with the (.+) reason$/) do |reason|
  @reason = reason
  pupil_reason_page.select_reason(@reason)
  @pupils = pupil_reason_page.pupil_list.rows.select {|row| row.has_no_selected? && row.reason.text == 'N/A'}
  @pupils[0..3].each {|pupil| pupil.checkbox.click}
  @pupil_names = @pupils[0..3].map {|pupil| pupil.name.text}
end

Then(/^the sticky banner should display the pupil count$/) do
  expect(@page.sticky_banner.count.text).to eql "Pupil(s) selected: " + @pupil_names.size.to_s
end

Then(/^the sticky banner should display the total pupil count for pupil not taking the check$/) do
  total_pupil_count = pupils_not_taking_check_page.pupil_list.rows.count
  expect(@page.sticky_banner.selected_pupil_count.text).to eql total_pupil_count.to_s
end

Then(/^I should not see the pupil in the list$/) do
  generate_pupil_pins_page.generate_pin_btn.click if generate_pupil_pins_page.displayed?
  generated_pins_page.generate_more_pin_btn.click if generated_pins_page.displayed?
  pupil_list = generate_pupil_pins_page.pupil_list.rows.map{|row| row.name.text}
  expect(pupil_list).to_not include @pupil_lastname + ', ' + @pupil_forename
end

When(/^I choose to filter pupils via group on the pupil reason page$/) do
  pupil_reason_page.load
  pupil_reason_page.group_filter.closed_filter.click unless generate_pupil_pins_page.group_filter.has_opened_filter?
  group = pupil_reason_page.group_filter.groups.find {|group| group.name.text.include? @group_name}
  group.checkbox.click
end

Then(/^only those pupils from the group should be displayed$/) do
  filtered_pupils = pupil_reason_page.pupil_list.rows.map{|row| row.name.text}.reject(&:empty?)
  expect(filtered_pupils.sort).to eql @pupil_group_array.sort
end

Then(/^I should not see the group filter$/) do
  expect(pupil_reason_page.group_filter).to have_no_closed_filter
  expect(pupil_reason_page.group_filter).to have_no_opened_filter
end

Then(/^the group filter should be opened by default$/) do
  pupil_reason_page.load
  expect(pupil_reason_page.group_filter).to have_opened_filter
  expect(pupil_reason_page.group_filter).to have_no_closed_filter
end

And(/^I should be able to see a count of pupils in the group$/) do
  group = pupil_reason_page.group_filter.groups.find {|group| group.name.text.include? @group_name}
  expect(group.count.text.scan(/\d/).join('').to_i).to eql @pupil_group_array.size
end