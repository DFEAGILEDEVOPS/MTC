Given(/^I am on the groups page$/) do
  step 'I am logged in'
  school_landing_page.group_pupils.click
end

Then(/^I should see a heading on the groups page$/) do
  expect(group_pupils_page).to have_heading
end

Then(/^I should see a intro$/) do
  expect(group_pupils_page).to have_intro
end

Then(/^I should see a option to create a new group$/) do
  expect(group_pupils_page).to have_create_group
end

Then(/^I should see a table of existing groups$/) do
  group_pupils_page.load
  expect(group_pupils_page.group_list).to be_all_there
end

Then(/^I should see related content$/) do
  expect(group_pupils_page).to have_related_heading
  expect(group_pupils_page).to have_guidance
  expect(group_pupils_page).to have_pupil_register
  expect(group_pupils_page).to have_generate_pins
end

Given(/^I am on the create group page$/) do
  step 'I am logged in'
  school_landing_page.group_pupils.click
  group_pupils_page.create_group.click
end

When(/^group name is left empty$/) do
  add_edit_groups_page.group_name.set ''
  add_edit_groups_page.pupil_list.rows.first.checkbox.click
end

Then(/^I should not see the stick banner$/) do
  expect(add_edit_groups_page.sticky_banner).to_not be_visible
end

When(/^group name is longer than (\d+) characters$/) do |number|
  group_name = ('F' * (number.to_i + 1))
  add_edit_groups_page.group_name.set group_name
  add_edit_groups_page.pupil_list.rows.first.checkbox.click
  add_edit_groups_page.sticky_banner.confirm.click
end

Then(/^I should see a validation error for the group name$/) do
  expect(add_edit_groups_page.error_summary).to be_all_there
  expect(add_edit_groups_page).to have_length_error
end

Then(/^I should see validation errors for group name when I enter the following special characters$/) do |table|
  add_edit_groups_page.pupil_list.rows.first.checkbox.click
  table.raw.flatten.each do |group_name|
    add_edit_groups_page.group_name.set group_name
    add_edit_groups_page.sticky_banner.confirm.click
    expect(add_edit_groups_page.error_summary).to be_all_there
    expect(add_edit_groups_page).to have_special_char_error
  end
end

Then(/^I can enter the following special characters as the group name$/) do |table|
  step 'I am logged in'
  school_landing_page.group_pupils.click
  @group_name = []
  table.raw.flatten.each do |value|
    group_pupils_page.create_group.click
    @group_name << value
    add_edit_groups_page.group_name.set value
    add_edit_groups_page.pupil_list.rows.first.checkbox.click
    add_edit_groups_page.sticky_banner.confirm.click
    expect(group_pupils_page.info_message.text).to eql 'New group created'
    new_group_row = group_pupils_page.group_list.rows.find {|row| row.has_highlight?}
    expect(new_group_row.group_name.text).to eql value
  end
end

Given(/^I have added already added a pupil to another group$/) do
  step 'I am on the create group page'
  add_edit_groups_page.group_name.set 'Group1'+ (rand(23243)).to_s
  pupil = add_edit_groups_page.pupil_list.rows.first
  pupil.checkbox.click
  @pupil_name = pupil.name.text
  add_edit_groups_page.sticky_banner.confirm.click
  expect(group_pupils_page.info_message.text).to eql 'New group created'
end

When(/^I want to create a new group$/) do
  group_pupils_page.create_group.click
end

Then(/^I should not see pupils who are assigned to another group$/) do
  available_pupils = add_edit_groups_page.pupil_list.rows.map {|row| row.name.text}
  expect(available_pupils).to_not include @pupil_name
end

Given(/^there are (\d+) pupils with the same names$/) do |arg|
  step 'I am logged in'
  @pupil_name = (0...8).map {(65 + rand(26)).chr}.join
  2.times do
    step 'I am on the add pupil page'
    @upn = UpnGenerator.generate
    @details_hash = {first_name: @pupil_name, middle_name: (0...8).map {(65 + rand(26)).chr}.join, last_name: @pupil_name, upn: @upn, female: true, day: (rand(0..30)).to_s, month: '02', year: '2010'}
    @page.enter_details(@details_hash)
    @page.add_pupil.click
  end
end

When(/^I select (\d+) pupils$/) do |arg|
  add_edit_groups_page.group_name.set 'Group1'+ (rand(23243)).to_s
  add_edit_groups_page.pupil_list.rows[0].checkbox.click
  page.execute_script "window.scrollBy(0,500)"
  add_edit_groups_page.pupil_list.rows[1].checkbox.click
end

Then(/^the sticky banner count should reflect this$/) do
  expect(add_edit_groups_page.sticky_banner.count.text.split(':').last.strip).to eql '2'
end


When(/^I select all pupils$/) do
  add_edit_groups_page.group_name.set 'Group1'+ (rand(23243)).to_s
  add_edit_groups_page.select_all_pupils.click
end

Then(/^the sticky banner count should reflect that all pupils have been selected$/) do
  expect(add_edit_groups_page.sticky_banner.count.text.split(':').last.strip).to eql add_edit_groups_page.pupil_list.rows.count.to_s
end


Given(/^I have selected all the pupils on the create group page$/) do
  step 'I am on the create group page'
  step 'I select all pupils'
end

When(/^I decide to unselect them all$/) do
  add_edit_groups_page.unselect_all_pupils.click
end

Then(/^the sticky banner should disappear$/) do
  expect(add_edit_groups_page.sticky_banner).to_not be_visible
end

When(/^I enter a valid group name$/) do
  @group_name = 'Group1'+ (rand(23243)).to_s
  add_edit_groups_page.group_name.set @group_name
end

And(/^select a pupil$/) do
  add_edit_groups_page.pupil_list.rows[0].checkbox.click
end

Then(/^I should see the sticky banner$/) do
  expect(add_edit_groups_page.sticky_banner).to be_visible
end

Given(/^I have created a group$/) do
  step 'I am on the create group page'
  step 'I enter a valid group name'
  step 'select a pupil'
  add_edit_groups_page.sticky_banner.confirm.click
end

Then(/^I should see the group page reflect this$/) do
  expect(group_pupils_page.info_message.text).to eql 'New group created'
end

Given(/^I want to edit a previously added group$/) do
  step 'I have created a group'
  previoulsy_created_group = group_pupils_page.group_list.rows.find {|row| row.group_name.text.include? @group_name}
  previoulsy_created_group.group_name.click
end

Then(/^I should be able to add and remove pupils$/) do
  page.execute_script "window.scrollBy(0,500)"
  add_edit_groups_page.pupil_list.rows[1].checkbox.click
  add_edit_groups_page.pupil_list.rows[2].checkbox.click
  add_edit_groups_page.sticky_banner.confirm.click
  expect(group_pupils_page.info_message.text).to eql "Changes made to '#{@group_name}'"
  group_row = group_pupils_page.group_list.rows.find {|row| row.has_highlight?}
  expect(group_row.group_name.text).to eql @group_name
end

Then(/^I should be able to edit the group name$/) do
  new_value = 'Group1'+ (rand(23243)).to_s
  add_edit_groups_page.group_name.set new_value
  add_edit_groups_page.sticky_banner.confirm.click
  expect(group_pupils_page).to have_info_message
  expect(group_pupils_page.info_message.text).to eql "Changes made to '#{new_value}'"
  group_row = group_pupils_page.group_list.rows.find {|row| row.has_highlight?}
  expect(group_row.group_name.text).to eql new_value
end


When(/^I attempt to use the same group name for a new group$/) do
  group_pupils_page.create_group.click
  add_edit_groups_page.group_name.set @group_name
  add_edit_groups_page.pupil_list.rows[0].checkbox.click
  add_edit_groups_page.sticky_banner.confirm.click
end

Then(/^I should see an error for duplicate group name$/) do
  expect(add_edit_groups_page.error_summary).to be_all_there
  expect(add_edit_groups_page).to have_name_already_in_use
  expect(add_edit_groups_page.name_already_in_use.text).to eql @group_name + ' already exists. Enter a different name.'
end

When(/^I attempt to use the same group name for a new group with a different case$/) do
  group_pupils_page.create_group.click
  @group_name = @group_name.upcase
  add_edit_groups_page.group_name.set @group_name
  add_edit_groups_page.pupil_list.rows[0].checkbox.click
  add_edit_groups_page.sticky_banner.confirm.click
end

Given(/^groups have been previoulsy created$/) do
  step 'I have created a group'
end

Given(/^I can see the sticky banner$/) do
  step "I am on the create group page"
  step "I enter a valid group name"
  step "select a pupil"
end

When(/^decide to cancel creating a group$/) do
  add_edit_groups_page.sticky_banner.cancel.click
end

Then(/^I should be returned to the group hub page$/) do
  expect(group_pupils_page).to be_displayed
end

Then(/^I should be able to remove the group$/) do
  group_pupils_page.remove_group(@group_name)
  if group_pupils_page.has_group_list?
    expect(group_pupils_page.group_list.rows.find {|row| row.group_name.text.include? @group_name}).to be_nil
  else
    expect(group_pupils_page).to have_no_group_list
  end
  expect(group_pupils_page.info_message.text).to eql 'Group deleted'
end

When(/^I choose to remove the group$/) do
  row = group_pupils_page.group_list.rows.find {|row| row.group_name.text.include? @group_name}
  row.remove.click
end

But(/^decide against it and cancel$/) do
  group_pupils_page.modal.cancel.click
end

Then(/^the group should not be removed$/) do
  expect(group_pupils_page.group_list.rows.find {|row| row.group_name.text.include? @group_name}).to_not be_nil
end

Then(/^I should see the number of pupils in that group on the group hub page$/) do
  row = group_pupils_page.group_list.rows.find {|row| row.has_highlight?}
  expect(row.group_count.text).to eql '(1 pupils)'
end

And(/^the group should be soft deleted from the db$/) do
  group = SqlDbHelper.find_group(@group_name)
  expect(group['isDeleted']).to be_truthy
end

Given(/^I have created a group with (\d+) pupils$/) do |number_of_pupils|
  step 'I am on the create group page'
  step 'I enter a valid group name'
  page.execute_script "window.scrollBy(0,500)"
  @pupil_names = []
  number_of_pupils.to_i.times do |index|
    add_edit_groups_page.pupil_list.rows[index].checkbox.click
    @pupil_names << add_edit_groups_page.pupil_list.rows[index].name.text
  end
  add_edit_groups_page.sticky_banner.confirm.click
end

Then(/^I should the group stored in the DB$/) do
  pupil_ids_array = SqlDbHelper.get_pupil_ids_from_group(@group_name)
  pupils_names_from_db = SqlDbHelper.pupils_assigned_to_group(pupil_ids_array)
  expect(pupils_names_from_db.sort).to eql @pupil_names.sort
end

Given(/^I have a group of pupils$/) do
  step 'I am on the create group page'
  step 'I enter a valid group name'
  @pupil_group_array = []
  add_edit_groups_page.pupil_list.rows[0].checkbox.click
  @pupil_group_array << add_edit_groups_page.pupil_list.rows[0].name.text
  page.execute_script "window.scrollBy(0,500)"
  add_edit_groups_page.pupil_list.rows[1].checkbox.click
  @pupil_group_array << add_edit_groups_page.pupil_list.rows[1].name.text
  add_edit_groups_page.pupil_list.rows[2].checkbox.click
  @pupil_group_array << add_edit_groups_page.pupil_list.rows[2].name.text
  add_edit_groups_page.pupil_list.rows[3].checkbox.click
  @pupil_group_array << add_edit_groups_page.pupil_list.rows[3].name.text
  add_edit_groups_page.sticky_banner.confirm.click
end

When(/^I add these pupils to a group$/) do
  school_landing_page.load
  school_landing_page.group_pupils.click
  group_pupils_page.create_group.click
  step 'I enter a valid group name'
  current_window_size = page.driver.browser.manage.window.size
  page.driver.browser.manage.window.resize_to(current_window_size.width,2000)
  @pupil_names_arr.each {|pupil| add_edit_groups_page.pupil_list.rows.find{|row| row.checkbox.click if row.name.text == pupil}}
  page.driver.browser.manage.window.resize_to(current_window_size.width,current_window_size.height)
  add_edit_groups_page.sticky_banner.confirm.click
end