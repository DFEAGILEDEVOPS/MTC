And(/^I navigate to generate passwords and pins page$/) do
  school_landing_page.generate_passwords_and_pins.click
end

Then(/^generate pin overview page for live check is displayed as per design$/) do
  expect(generate_live_pins_overview_page).to have_heading
  expect(generate_live_pins_overview_page).to have_generate_pin_message
  expect(generate_live_pins_overview_page).to have_access_arrangment_text
  expect(generate_live_pins_overview_page).to have_access_arrangment_link
end

Then(/^generated pin overview page for live check with some pin generated is displayed as per design$/) do
  expect(generate_live_pins_overview_page.generated_pin_overview).to be_all_there
end

Given(/^I have a pupil not taking the check$/) do
  step 'I am on the pupil reason page for new pupil'
  step 'I add Incorrect registration as a reason for a particular pupil'
  step 'the Incorrect registration reason should be stored against the pupils'
  sleep 3
end

Given(/I have a pupil not taking the check with reason '(.*)'/) do |reason|
  step 'I am on the pupil reason page for new pupil'
  step "I add #{reason} as a reason for a particular pupil"
end

Then(/^I cannot see this pupil in the list of Pupil on Generate Pin list page$/) do
  pupils_from_page = generate_live_pins_overview_page.pupil_list.rows.map {|x| x.name.text}
  expect(pupils_from_page.include?(@pupil_forename)).to be_falsy, "#{@pupil_forename} is displayed in the list ... Expected - It Shouldn't"
end

Then(/^I cannot see pupil in the list for pupil for not taking check$/) do
  pupils_from_page = pupil_reason_page.pupil_list.rows.map {|t| t.name.text}
  expect(pupils_from_page.join.include?(@pupil_forename)).to be_falsy, "#{@pupil_forename} is displayed in the list ... Expected - It Shouldn't"
end

Then(/^I can see pupil in the list for pupil for not taking check$/) do
  Timeout.timeout(ENV['WAIT_TIME'].to_i) {visit current_url until pupil_reason_page.pupil_list.rows.map {|t| t.name.text}.join.include?(@pupil_forename)}
end

When(/^I click on the Pupil heading$/) do
  generate_live_pins_overview_page.pupil_column_heading.click
end

Then(/^I should see a list of pupils sorted by surname in '(.*)' order on Generate Pins List Page$/) do |sort_order|
  if sort_order.eql?('descending')
    sorted_pupils_from_page = generate_live_pins_overview_page.pupil_list.rows.map {|x| x.name.text}.sort.reverse
  else
    sorted_pupils_from_page = generate_live_pins_overview_page.pupil_list.rows.map {|x| x.name.text}.sort
  end

  pupils_from_page = generate_live_pins_overview_page.pupil_list.rows.map {|x| x.name.text}
  expect(sorted_pupils_from_page).to match_array(pupils_from_page)
end

Then(/^I should be able to select them via a checkbox on Generate Pin page$/) do
  generate_live_pins_overview_page.pupil_list.rows.each {|pupil| expect(pupil).to have_checkbox}
end

Then(/^I should have a option to select all pupils on Generate Pin page$/) do
  expect(generate_live_pins_overview_page).to have_select_all_pupils
end

Then(/^I should be taken to Generate Pupil Pins Page$/) do
  pins_page = generate_live_pins_overview_page.displayed? ? generate_live_pins_overview_page : view_and_print_live_pins_page
  expect(pins_page).to be_displayed
end

Then(/^I should be taken to Generated Pins Page$/) do
  expect(generate_live_pins_overview_page).to be_displayed
end

When(/^I select a Pupil from Generate Pin page$/) do
  pupil = generate_live_pins_overview_page.pupil_list.rows.find {|row| row.has_no_selected?}
  pupil.checkbox.click
end

When(/^I select all pupils for Generate pin$/) do
  generate_live_pins_overview_page.select_all_pupils.click
end

When(/^I deselect all pupils from Generate Pin Page$/) do
  generate_live_pins_overview_page.select_all_pupils.click
  expect(@page).to have_sticky_banner
  generate_live_pins_overview_page.select_all_pupils.click
end

When('I am on the generate pupil live pins page') do
  navigate_to_pupil_list_for_pin_gen('live')
  @page = generate_live_pins_overview_page
end

When(/^I select a Pupil to Generate more pins$/) do
  step "I am on the generate pupil live pins page"
  pupil = generate_live_pins_overview_page.pupil_list.rows.find {|row| row.has_no_selected?}
  pupil.checkbox.click
end

When(/^I select multiple pupils from Generate Pin Page$/) do
  @pupils = generate_live_pins_overview_page.pupil_list.rows.select {|row| row.has_no_selected?}
  @pupils[0..3].each {|pupil| pupil.checkbox.click}
  @pupil_names = @pupils[0..3].map {|pupil| pupil.name.text}
end

When(/^I have generated a live pin for a pupil$/) do
  name = (0...8).map {(65 + rand(26)).chr}.join
  step "I am logged in"
  step "I am on the add pupil page"
  step "I submit the form with the name fields set as #{name}"
  step "the pupil details should be stored"
  navigate_to_pupil_list_for_pin_gen('live')
  @pupil_forename = name
  @page = generate_live_pins_overview_page
  @pupil_name = generate_live_pins_overview_page.generate_pin_using_name(name)
  pupil_pin_row = view_and_print_live_pins_page.pupil_list.rows.find {|row| row.name.text == @pupil_name}
  @pupil_credentials = {:school_password => pupil_pin_row.school_password.text, :pin => pupil_pin_row.pin.text}
  @check_code = SqlDbHelper.check_details(@stored_pupil_details['id'])['checkCode']
end

When(/^I click view all pins button$/) do
  generate_live_pins_overview_page.view_all_pins_btn.click
end

Given(/^I have generated pin for all pupil$/) do
  SqlDbHelper.delete_pupils_not_taking_check(@school_id)
  SqlDbHelper.set_pupil_attendance_via_school(5, 'null')
  step "I have signed in with #{@username}"
  step "I am on the generate pupil live pins page"
  generate_live_pins_overview_page.select_all_pupils.click
  generate_live_pins_overview_page.sticky_banner.confirm.click
end

Then(/^the pin should consist of (\d+) characters$/) do |size|
  expect(view_and_print_live_pins_page.find_pupil_row(@pupil_name).pin.text.size).to eql size.to_i
end

Then(/^the school password should consist of (\d+) characters$/) do |size|
  expect(view_and_print_live_pins_page.find_pupil_row(@pupil_name).school_password.text.size).to eql size.to_i
end

Then(/^the school password should not contain charachter 'q'$/) do
  school_pwd = view_and_print_live_pins_page.find_pupil_row(@pupil_name).school_password.text
  school_pwd.split('').each {|char| expect(char.eql?('q')).to be_falsey, "'q' char is included in school password - #{school_pwd}"}
end

Then(/^all pupil pins should be generated from the specified pool of characters$/) do
  pins_array = view_and_print_live_pins_page.pupil_list.rows.map {|pupil| pupil.pin.text}
  pins_array.each {|pin| pin.split('').each {|char| expect("23456789").to include char}}
end

Then(/^school password should be generated from the specified pool of characters$/) do
  school_pwd = view_and_print_live_pins_page.find_pupil_row(@pupil_name).school_password.text
  school_pwd.split('').each {|char| expect("23456789abcdefghijklmnoprstuvwxyz").to include char}
end

Given(/^I have generated pins for multiple pupils$/) do
  step "I am logged in"
  step "I am on the add multiple pupil page"
  @upn_list = add_multiple_pupil_page.create_and_upload_multiple_pupils(3, 'pin_gen.csv')
  step 'I am on the generate pupil live pins page'
  @pupil_names_arr = @upn_list.map {|upn| SqlDbHelper.pupil_details(upn, @school_id)['lastName'] + ', ' + SqlDbHelper.pupil_details(upn, @school_id)['foreName']}
  generate_live_pins_overview_page.generate_pin_using_list_of_names(@pupil_names_arr)
end

Then(/^each pin should be displayed next to the pupil its assigned to$/) do
  view_and_print_live_pins_page.load
  @pupil_names_arr.each {|name| expect(view_and_print_live_pins_page.find_pupil_row(name)).to have_pin}
end

Then(/^the pupil pin should be unique$/) do
  pins_before = SqlDbHelper.pupil_pins
  expect(SqlDbHelper.pupil_pins.uniq).to eql pins_before
end

Then(/^the pin should be stored against the pupil$/) do
  pupil_upn = @stored_pupil_details['upn'].to_s
  pupil_id = SqlDbHelper.pupil_details(pupil_upn, @school_id)['id']
  check_entry = SqlDbHelper.check_details(pupil_id)
  pupil_pin = SqlDbHelper.get_pupil_pin(check_entry['id'])['val']
  expect(view_and_print_live_pins_page.find_pupil_row(@pupil_name).pin.text).to eql pupil_pin.to_s
end

Then(/^check form should be assigned to the pupil$/) do
  pupil_upn = @stored_pupil_details['upn'].to_s
  pupil_id = SqlDbHelper.pupil_details(pupil_upn, @school_id)['id']
  check_entry = SqlDbHelper.check_details(pupil_id)
  expect(check_entry['checkForm_id'].nil?).to be_falsey, "Check Form is not assigned to the Pupil when pin is generated"
  expect(SqlDbHelper.check_form_details_using_id(check_entry['checkForm_id'])['isDeleted']).to be_falsey
end

Then(/^I should see the school password for (.*)$/) do |teacher|
  school_id = SqlDbHelper.find_teacher(teacher)['school_id']
  school_password = SqlDbHelper.find_school(school_id)['pin']
  expect(view_and_print_live_pins_page.find_pupil_row(@pupil_name).school_password.text).to eql school_password
end

Then(/^I should see information for Pupil pin and School password$/) do
  cd = Time.now
  str1 = "#{cd.strftime('%A')} #{cd.strftime('%-d')} #{cd.strftime('%B')}"
  expect(view_and_print_live_pins_page.school_password_info.text.include?('Pupil PINs and school password generated')).to be_truthy, "Expected:'Pupil PINs and school password generated' -- not found"
  expect(view_and_print_live_pins_page.school_password_info.text.include?("Valid only until 4pm, #{str1}")).to be_truthy, "Expected: 'Valid only until 4pm, #{str1}' -- not found"
end

Then(/^I should see link to download all pupil pins$/) do
  expect(view_and_print_live_pins_page).to have_download_pin_link
end

Then(/^I should see link to create custom download$/) do
  expect(view_and_print_live_pins_page).to have_custom_download_link
end

Then(/^the sticky banner should display the total pupil count on Generate Pin Page$/) do
  total_pupil_count = generate_live_pins_overview_page.pupil_list.rows.count
  expect(@page.sticky_banner.selected_count.text).to eql total_pupil_count.to_s
end

When(/^I decide the pupil should not be taking the check$/) do
  pupil_reason_page.load
  pupil_reason_page.add_reason_for_pupil(@pupil_name, 'Absent')
end

Then(/^the pin should be expired$/) do
  generate_live_pins_overview_page.load
  if generate_live_pins_overview_page.has_pupil_list?
    pupil_pins = generate_live_pins_overview_page.pupil_list.rows.map {|row| row.name.text}
    expect(pupil_pins).to_not include @pupil_name
  else
    expect(generate_live_pins_overview_page).to have_no_pupil_list
  end
end

And(/^the status of the pupil should be (.+)$/) do |status|
  Timeout.timeout(ENV['WAIT_TIME'].to_i) {sleep 2 until SqlDbHelper.pupil_details(@stored_pupil_details['upn'], @school_id)['pupilStatus_id'] == 6}
  pupil_register_page.load
  pupil_row = pupil_register_page.find_pupil_row(@pupil_name)
  expect(pupil_row.result.text).to eql(status)
end

When(/^I choose to filter via group on the generate pins page$/) do
  navigate_to_pupil_list_for_pin_gen('live')
  @page = generate_live_pins_overview_page
  Timeout.timeout(ENV['WAIT_TIME'].to_i) {visit current_url until !generate_live_pins_overview_page.group_filter.groups.empty?}
  Timeout.timeout(ENV['WAIT_TIME'].to_i) {visit current_url until generate_live_pins_overview_page.group_filter.groups.first.count.text.scan(/\d+/).first.to_i == (@pupil_group_array - [@excluded_pupil]).size}
  generate_live_pins_overview_page.group_filter.closed_filter.click unless generate_live_pins_overview_page.group_filter.has_opened_filter?
  group = generate_live_pins_overview_page.group_filter.groups.find {|group| group.name.text.include? @group_name}
  group.checkbox.click
end

Then(/^I should only see pupils from the group$/) do
  filtered_pupils = generate_live_pins_overview_page.pupil_list.rows.map {|row| row.name.text.split('Date').first}.compact.map {|pupil| pupil.strip}
  expect(filtered_pupils.count).to eql @pupil_group_array.count
end

And(/^I should be able to generate pins for all pupils in this group$/) do
  generate_live_pins_overview_page.select_all_pupils.click
  generate_live_pins_overview_page.sticky_banner.confirm.click
  group = view_and_print_live_pins_page.groups.find {|group| group.name.text.include? @group_name}
  group.checkbox.click
  pupils_with_pins = view_and_print_live_pins_page.pupil_list.rows.select {|row| row.group.text.include?(@group_name)}
  names = pupils_with_pins.map {|row| row.name.text}
  expect((@pupil_group_array - [@excluded_pupil].sort).count - names.map {|name| name.split(' Date')[0].size}.count).to eql 0
  pupil_pin_row = view_and_print_live_pins_page.pupil_list.rows.find {|row| row.name.text.include?(@pupil_group_array[1])}
  @pupil_credentials = {:school_password => pupil_pin_row.school_password.text, :pin => pupil_pin_row.pin.text}
  # RedisHelper.wait_for_prepared_check(@pupil_credentials[:school_password], @pupil_credentials[:pin])
end

And(/^that pupil is apart of a group$/) do
  @excluded_pupil = @pupil_lastname + ", " + @pupil_forename
  @pupil_group_array = []
  for i in 0..3
    name = (0...8).map {(65 + rand(26)).chr}.join
    step "I am on the add pupil page"
    step "I submit the form with the name fields set as #{name}"
    step "the pupil details should be stored"
    @pupil_forename = name
    @pupil_lastname = name
    @pupil_group_array << @pupil_lastname + ", " + @pupil_forename
  end
  group_pupils_page.load
  group_pupils_page.create_group.click
  step 'I enter a valid group name'

  excluded_pupil = add_edit_groups_page.pupil_list.rows.find {|row| row.name.text == @excluded_pupil}
  @pupil_group_array << excluded_pupil.name.text
  @pupil_group_array.each {|pupil| add_edit_groups_page.select_pupil_for_a_group(pupil)}
  add_edit_groups_page.sticky_banner.confirm.click
end

Then(/^I should only see pupils available for taking the check$/) do
  filtered_pupils = generate_live_pins_overview_page.pupil_list.rows.map {|row| row.name.text.split(' Date')[0]}.compact
  expect(@pupil_group_array.sort - [@excluded_pupil]).to eql filtered_pupils.sort
end

Given(/^I have generated pins for all pupils in a group$/) do
  step 'I have a group of pupils'
  step 'I choose to filter via group on the generate pins page'
  step 'I should only see pupils from the group'
  view_and_print_live_pins_page.load
  if view_and_print_live_pins_page.has_pupil_list?
    @before_pin_gen = view_and_print_live_pins_page.pupil_list.rows.size
  else
    @before_pin_gen = 0
  end
  navigate_to_pupil_list_for_pin_gen('live')
  group = generate_live_pins_overview_page.group_filter.groups.find {|group| group.name.text.include? @group_name}
  group.checkbox.click
  generate_live_pins_overview_page.select_all_pupils.click
  generate_live_pins_overview_page.sticky_banner.confirm.click
  expect(view_and_print_live_pins_page.pupil_list.rows.size).to eql @before_pin_gen + @pupil_group_array.size
  pupil_pin_row = view_and_print_live_pins_page.pupil_list.rows.find {|row| row.name.text.include?(@pupil_group_array[1])}
  @pupil_credentials = {:school_password => pupil_pin_row.school_password.text, :pin => pupil_pin_row.pin.text}
  # RedisHelper.wait_for_prepared_check(@pupil_credentials[:school_password], @pupil_credentials[:pin])
end


Then(/^I can no longer use this group to filter on the generate pins page$/) do
  generate_live_pins_overview_page.load
  generate_live_pins_overview_page.generated_pin_overview.generate_additional_pins_btn.click
  expect(generate_live_pins_overview_page.group_filter).to have_no_closed_filter
  expect(generate_live_pins_overview_page.group_filter).to have_no_opened_filter
end

Then(/^I should be able to filter by groups on the generate pins page$/) do
  view_and_print_live_pins_page.load
  view_and_print_live_pins_page.generate_more_pin_btn.click
  generate_live_pins_overview_page.group_filter.closed_filter.click unless generate_live_pins_overview_page.group_filter.has_opened_filter?
  group = generate_live_pins_overview_page.group_filter.groups.find {|group| group.name.text.include? @group_name}
  group.checkbox.click
  filtered_pupils = generate_live_pins_overview_page.pupil_list.rows.map {|row| row.name.text}.reject(&:empty?)
  expect(filtered_pupils).to eql [@pupil_group_array.first]
end

And(/^I should be able to see a count of pupils$/) do
  group = generate_live_pins_overview_page.group_filter.groups.find {|group| group.name.text.include? @group_name}
  expect(group.count.text.scan(/\d/).join('').to_i).to eql @pupil_group_array.size
end

Then(/^I should see an error message stating the service is unavailable$/) do
  sleep 1
  REDIS_CLIENT.del 'checkWindow.sqlFindActiveCheckWindow'
  pupil_register_page.load
  generate_live_pins_overview_page.load
  expect(page).to have_content("The service is unavailable")
end

Then(/^I should see related content on the generate pins page$/) do
  expect(generate_live_pins_overview_page).to have_related_heading
  expect(generate_live_pins_overview_page).to have_guidance
end

Then(/^I should see generated pin page as per design$/) do
  step "I should see the school password for #{@username}"
end

And(/^the displayed school password is generated as per the requirement$/) do
  step 'the school password should consist of 8 characters'
  step "the school password should not contain charachter 'q'"
  step 'school password should be generated from the specified pool of characters'
end

Then(/^I should see that I should not be able to generate a pin$/) do
  expect(school_landing_page).to have_generate_pupil_pin_disabled
end

Given(/^I want to generate pins for a group of 255 pupils with a teacher$/) do
  step "I am logged in"
  step 'I am on the add multiple pupil page'
  @upns_for_school = add_multiple_pupil_page.upload_pupils(255, @school_name)
  visit ENV['ADMIN_BASE_URL'] + '/sign-out'
  step "I am on the create group page"
  step "I select all pupils"
  add_edit_groups_page.sticky_banner.confirm.click
  navigate_to_pupil_list_for_pin_gen('live')
end

When(/^I select all (\d+) pupils$/) do |arg|
  group = generate_live_pins_overview_page.group_filter.groups.find {|group| group.name.text.include? @group_name}
  group.checkbox.click
  generate_live_pins_overview_page.select_all_pupils.click
  expect(generate_live_pins_overview_page.sticky_banner.selected_count.text.to_i).to eql 255
  generate_live_pins_overview_page.sticky_banner.confirm.click
end

Then(/^I should be able to generate pins$/) do
  expect(current_url).to include '/view-and-custom-print-live-pins'
  expect(view_and_print_live_pins_page.pupil_list.rows.size).to eql 255
end


Given(/^I am on the generate pupil pins page after logging in with a teacher$/) do
  expect(REDIS_CLIENT.get("checkWindow.sqlFindActiveCheckWindow")).to be_nil
  step "I am logged in"
  expect(school_landing_page).to be_displayed
  Timeout.timeout(20) {visit current_url until REDIS_CLIENT.get("checkWindow.sqlFindActiveCheckWindow") != nil}
  expect(JSON.parse(JSON.parse(REDIS_CLIENT.get("checkWindow.sqlFindActiveCheckWindow"))['value'])['recordset']).to be_empty
end


Then(/^the user should be stored to identify who created the check$/) do
  pupil_upn = @stored_pupil_details['upn'].to_s
  pupil_id = SqlDbHelper.pupil_details(pupil_upn, @school_id)['id']
  check_entry = SqlDbHelper.check_details(pupil_id)
  user_id = SqlDbHelper.find_teacher(@user)['id']
  expect(check_entry['createdBy_userId']).to eql user_id
end


When(/^I am on the generate pupil live pins overview page$/) do
  generate_live_pins_overview_page.load
end
