And(/^I am on the generate pupil pins page$/) do
  generate_pins_overview_page.load
end

And(/^I navigate to generate pupil pins page$/) do
  school_landing_page.generate_pupil_pin.click
end

And(/^I navigate to generate pupil pins familiarisation page$/) do
  school_landing_page.generate_pupil_pin_familiarisation.click
end

Then(/^generate pin overview page for live check is displayed as per design$/) do
  expect(generate_pins_overview_page).to have_heading
  expect(generate_pins_overview_page).to have_generate_pin_message
  expect(generate_pins_overview_page).to have_access_arrangment_text
  expect(generate_pins_overview_page).to have_access_arrangment_link
  expect(generate_pins_overview_page).to have_instruction_section
  generate_pins_overview_page.instruction_section.toggle.click
  expect(generate_pins_overview_page.instruction_section.info_message[0].text).to include "Press 'Generate PINs' button."
  expect(generate_pins_overview_page.instruction_section.info_message[1].text).to include "Select which pupils you are generating pins for."
  expect(generate_pins_overview_page.instruction_section.info_message[2].text).to include "Distribute pupil PINs and school password to your pupils."
end

Then(/^generated pin overview page for live check with some pin generated is displayed as per design$/) do
  expect(generate_pins_overview_page.generated_pin_overview).to be_all_there
end

And(/^I click Generate PINs button$/) do
  generate_pins_overview_page.generate_pin_btn.click if generate_pins_overview_page.has_generate_pin_btn?
  view_and_custom_print_live_check_page.generate_more_pin_btn.click if view_and_custom_print_live_check_page.has_generate_more_pin_btn?
end

Given(/^I have a pupil not taking the check$/) do
  step 'I am on the pupil reason page for new pupil'
  step 'I add Absent as a reason for a particular pupil'
  step 'the Absent reason should be stored against the pupils'
  sleep 3
end

Given(/I have a pupil not taking the check with reason '(.*)'/) do |reason|
  step 'I am on the pupil reason page for new pupil'
  step "I add #{reason} as a reason for a particular pupil"
end

Then(/^I cannot see this pupil in the list of Pupil on Generate Pin list page$/) do
  pupils_from_page = generate_pins_overview_page.pupil_list.rows.map {|x| x.name.text}
  expect(pupils_from_page.include?(@pupil_forename)).to be_falsy, "#{@pupil_forename} is displayed in the list ... Expected - It Shouldn't"
end

Then(/^I cannot see pupil in the list for pupil for not taking check$/) do
  pupils_from_page = pupil_reason_page.pupil_list.rows.map {|t| t.name.text}
  expect(pupils_from_page.join.include?(@pupil_forename)).to be_falsy, "#{@pupil_forename} is displayed in the list ... Expected - It Shouldn't"
end

Then(/^I can see pupil in the list for pupil for not taking check$/) do
  Timeout.timeout(ENV['WAIT_TIME'].to_i){visit current_url until pupil_reason_page.pupil_list.rows.map {|t| t.name.text}.join.include?(@pupil_forename)}
end

When(/^I click on the Pupil heading$/) do
  generate_pins_overview_page.pupil_column_heading.click
end

Then(/^I should see a list of pupils sorted by surname in '(.*)' order on Generate Pins List Page$/) do |sort_order|
  if sort_order.eql?('descending')
    sorted_pupils_from_page = generate_pins_overview_page.pupil_list.rows.map {|x| x.name.text}.sort.reverse
  else
    sorted_pupils_from_page = generate_pins_overview_page.pupil_list.rows.map {|x| x.name.text}.sort
  end

  pupils_from_page = generate_pins_overview_page.pupil_list.rows.map {|x| x.name.text}
  expect(sorted_pupils_from_page).to match_array(pupils_from_page)
end

And(/^I am on Generate pins Pupil List page$/) do
  step 'I navigate to generate pupil pins page'
  step 'I click Generate PINs button'
  @page = generate_pins_overview_page
end

Then(/^I should be able to select them via a checkbox on Generate Pin page$/) do
  generate_pins_overview_page.pupil_list.rows.each {|pupil| expect(pupil).to have_checkbox}
end

Then(/^I should have a option to select all pupils on Generate Pin page$/) do
  expect(generate_pins_overview_page).to have_select_all_pupils
end

Then(/^I should be taken to Generate Pupil Pins Page$/) do
  pins_page = generate_pins_overview_page.displayed? ? generate_pins_overview_page : view_and_custom_print_live_check_page
  expect(pins_page).to be_displayed
end

Then(/^I should be taken to Generated Pins Page$/) do
  expect(generate_pins_overview_page).to be_displayed
end

When(/^I select a Pupil from Generate Pin page$/) do
  pupil = generate_pins_overview_page.pupil_list.rows.find {|row| row.has_no_selected?}
  pupil.checkbox.click
end

When(/^I select all pupils for Generate pin$/) do
  generate_pins_overview_page.select_all_pupils.click
end

When(/^I deselect all pupils from Generate Pin Page$/) do
  generate_pins_overview_page.select_all_pupils.click
  expect(@page).to have_sticky_banner
  generate_pins_overview_page.select_all_pupils.click
end

When(/^I select a Pupil to Generate more pins$/) do
  step "I am on the generate pupil pins page"
  view_and_custom_print_live_check_page.generate_more_pin_btn.click
  pupil = generate_pins_overview_page.pupil_list.rows.find {|row| row.has_no_selected?}
  pupil.checkbox.click
end

When(/^I select multiple pupils from Generate Pin Page$/) do
  @pupils = generate_pins_overview_page.pupil_list.rows.select {|row| row.has_no_selected?}
  @pupils[0..3].each {|pupil| pupil.checkbox.click}
  @pupil_names = @pupils[0..3].map {|pupil| pupil.name.text}
end

When(/^I have generated a live pin for a pupil$/) do
  name = (0...8).map {(65 + rand(26)).chr}.join
  step "I am logged in"
  step "I am on the add pupil page"
  step "I submit the form with the name fields set as #{name}"
  step "the pupil details should be stored"
  step "I am on the generate pupil pins page"
  step "I click Generate PINs button"
  @pupil_forename = name
  @page = generate_pins_overview_page
  @pupil_name = generate_pins_overview_page.generate_pin_using_name(name)
end

When(/^I click view all pins button$/) do
  generate_pins_overview_page.view_all_pins_btn.click
end

Given(/^I have generated pin for all pupil$/) do
  SqlDbHelper.delete_pupils_not_taking_check
  SqlDbHelper.set_pupil_attendance_via_school(5,'null')
  step "I have signed in with teacher4"
  step "I am on Generate pins Pupil List page"
  generate_pins_overview_page.select_all_pupils.click
  generate_pins_overview_page.sticky_banner.confirm.click
end

Then(/^the pin should consist of (\d+) characters$/) do |size|
  expect(view_and_custom_print_live_check_page.find_pupil_row(@pupil_name).pin.text.size).to eql size.to_i
end

Then(/^the school password should consist of (\d+) characters$/) do |size|
  expect(view_and_custom_print_live_check_page.find_pupil_row(@pupil_name).school_password.text.size).to eql size.to_i
end

Then(/^the school password should not contain charachter 'q'$/) do
  school_pwd = view_and_custom_print_live_check_page.find_pupil_row(@pupil_name).school_password.text
  school_pwd.split('').each {|char| expect(char.eql?('q')).to be_falsey, "'q' char is included in school password - #{school_pwd}"}
end

Then(/^all pupil pins should be generated from the specified pool of characters$/) do
  pins_array = view_and_custom_print_live_check_page.pupil_list.rows.map {|pupil| pupil.pin.text}
  pins_array.each {|pin| pin.split('').each {|char| expect("23456789").to include char}}
end

Then(/^school password should be generated from the specified pool of characters$/) do
  school_pwd = view_and_custom_print_live_check_page.find_pupil_row(@pupil_name).school_password.text
  school_pwd.split('').each {|char| expect("23456789abcdefghijklmnoprstuvwxyz").to include char}
end

Given(/^I have generated pins for multiple pupils$/) do
  step "I have logged in with teacher1"
  step "I am on the add multiple pupil page"
  @upn_list = add_multiple_pupil_page.create_and_upload_multiple_pupils(3,'pin_gen.csv')
  generate_pins_overview_page.load
  step 'I click Generate PINs button'
  @pupil_names_arr = @upn_list.map {|upn| SqlDbHelper.pupil_details(upn)['lastName']+', ' + SqlDbHelper.pupil_details(upn)['foreName']}
  generate_pins_overview_page.generate_pin_using_list_of_names(@pupil_names_arr)
  step "I am on the generate pupil pins page"

end

Then(/^each pin should be displayed next to the pupil its assigned to$/) do
  view_and_custom_print_live_check_page.load
  @pupil_names_arr.each {|name| expect(view_and_custom_print_live_check_page.find_pupil_row(name)).to have_pin}
end

Then(/^the pupil pin should be unique$/) do
  pins_before = SqlDbHelper.pupil_pins
  expect(SqlDbHelper.pupil_pins.uniq).to eql pins_before
end

Then(/^the pin should be stored against the pupil$/) do
  pupil_upn = @stored_pupil_details['upn'].to_s
  pupil_id = SqlDbHelper.pupil_details(pupil_upn)['id']
  check_entry = SqlDbHelper.check_details(pupil_id)
  pupil_pin = SqlDbHelper.get_pupil_pin(check_entry['id'])['val']
  expect(view_and_custom_print_live_check_page.find_pupil_row(@pupil_name).pin.text).to eql pupil_pin.to_s
end

Then(/^check form should be assigned to the pupil$/) do
  pupil_upn = @stored_pupil_details['upn'].to_s
  pupil_id = SqlDbHelper.pupil_details(pupil_upn)['id']
  check_entry = SqlDbHelper.check_details(pupil_id)
  expect(check_entry['checkForm_id'].nil?).to be_falsey, "Check Form is not assigned to the Pupil when pin is generated"
  expect(SqlDbHelper.check_form_details_using_id(check_entry['checkForm_id'])['isDeleted']).to be_falsey
end

Then(/^I should see the school password for (.*)$/) do |teacher|
  school_id = SqlDbHelper.find_teacher(teacher)['school_id']
  school_password = SqlDbHelper.find_school(school_id)['pin']
  expect(view_and_custom_print_live_check_page.find_pupil_row(@pupil_name).school_password.text).to eql school_password
end

Then(/^I should see information for Pupil pin and School password$/) do
  cd = Time.now
  str1 = "#{cd.strftime('%A')} #{cd.strftime('%-d')} #{cd.strftime('%B')}"
  expect(view_and_custom_print_live_check_page.school_password_info.text.include?('Pupil PINs and school password generated')).to be_truthy, "Expected:'Pupil PINs and school password generated' -- not found"
  expect(view_and_custom_print_live_check_page.school_password_info.text.include?("Valid only until 4pm, #{str1}")).to be_truthy, "Expected: 'Valid only until 4pm, #{str1}' -- not found"
end

Then(/^I should see link to download all pupil pins$/) do
  expect(view_and_custom_print_live_check_page).to have_download_pin_link
end

Then(/^I should see link to create custom download$/) do
  expect(view_and_custom_print_live_check_page).to have_custom_download_link
end

Then(/^the sticky banner should display the total pupil count on Generate Pin Page$/) do
  total_pupil_count = generate_pins_overview_page.pupil_list.rows.count
  expect(@page.sticky_banner.selected_count.text).to eql total_pupil_count.to_s
end

When(/^I decide the pupil should not be taking the check$/) do
  pupil_reason_page.load
  pupil_reason_page.add_reason_for_pupil(@pupil_name, 'Absent')
end

Then(/^the pin should be expired$/) do
  generate_pins_overview_page.load
  if generate_pins_overview_page.has_pupil_list?
    pupil_pins = generate_pins_overview_page.pupil_list.rows.map {|row| row.name.text}
    expect(pupil_pins).to_not include @pupil_name
  else
    expect(generate_pins_overview_page).to have_no_pupil_list
  end
end

And(/^the status of the pupil should be (.+)$/) do |status|
  Timeout.timeout(ENV['WAIT_TIME'].to_i){sleep 2 until SqlDbHelper.pupil_details(@stored_pupil_details['upn'])['pupilStatus_id'] == 6}
  pupil_register_page.load
  pupil_row = pupil_register_page.find_pupil_row(@pupil_name)
  expect(pupil_row.result.text).to eql(status)
end

When(/^I choose to filter via group on the generate pins page$/) do
  generate_pins_overview_page.load
  step 'I click Generate PINs button'
  @page = generate_pins_overview_page
  Timeout.timeout(ENV['WAIT_TIME'].to_i){visit current_url until !generate_pins_overview_page.group_filter.groups.empty?}
  Timeout.timeout(ENV['WAIT_TIME'].to_i){visit current_url until generate_pins_overview_page.group_filter.groups.first.count.text.scan(/\d+/).first.to_i == (@pupil_group_array - [@excluded_pupil]).size}
  generate_pins_overview_page.group_filter.closed_filter.click unless generate_pins_overview_page.group_filter.has_opened_filter?
  group = generate_pins_overview_page.group_filter.groups.find {|group| group.name.text.include? @group_name}
  group.checkbox.click
end

When(/^I choose to filter via group on the generate pins familiarisation page$/) do
  sleep 20
  generate_pins_familiarisation_overview_page.load
  step 'I click Generate PINs button'
  @page = generate_pins_familiarisation_overview_page
  generate_pins_familiarisation_overview_page.group_filter.closed_filter.click unless generate_pins_overview_page.group_filter.has_opened_filter?
  group = generate_pins_familiarisation_overview_page.group_filter.groups.find {|group| group.name.text.include? @group_name}
  group.checkbox.click
end

Then(/^I should only see pupils from the group$/) do
  filtered_pupils = generate_pins_overview_page.pupil_list.rows.map {|row| row.name.text.split('Date').first}.compact.map {|pupil| pupil.strip}
  expect(filtered_pupils.count).to eql @pupil_group_array.count
end

And(/^I should be able to generate pins for all pupils in this group$/) do
  generate_pins_overview_page.select_all_pupils.click
  generate_pins_overview_page.sticky_banner.confirm.click
  group = view_and_custom_print_live_check_page.groups.find {|group| group.name.text.include? @group_name}
  group.checkbox.click
  pupils_with_pins = view_and_custom_print_live_check_page.pupil_list.rows.select {|row| row.group.text.include?(@group_name)}
  names = pupils_with_pins.map {|row| row.name.text}
  expect((@pupil_group_array - [@excluded_pupil].sort).count - names.map {|name| name.split(' Date')[0].size}.count).to eql 0
  pupil_pin_row = view_and_custom_print_live_check_page.pupil_list.rows.find {|row| row.name.text.include?(@pupil_group_array[1])}
  @pupil_credentials = {:school_password => pupil_pin_row.school_password.text, :pin => pupil_pin_row.pin.text}
  AzureTableHelper.wait_for_prepared_check(@pupil_credentials[:school_password],@pupil_credentials[:pin])

end

And(/^that pupil is apart of a group$/) do
  add_edit_groups_page.load(add_or_edit: 'add')
  step 'I enter a valid group name'
  @excluded_pupil = @pupil_lastname + ", " + @pupil_forename
  excluded_pupil = add_edit_groups_page.pupil_list.rows.find {|row| row.name.text == @excluded_pupil}
  @pupil_group_array = []
  excluded_pupil.checkbox.click
  @pupil_group_array << excluded_pupil.name.text
  add_edit_groups_page.pupil_list.rows[2].checkbox.click
  @pupil_group_array << add_edit_groups_page.pupil_list.rows[2].name.text
  add_edit_groups_page.pupil_list.rows[3].checkbox.click
  @pupil_group_array << add_edit_groups_page.pupil_list.rows[3].name.text
  add_edit_groups_page.sticky_banner.confirm.click
end

Then(/^I should only see pupils available for taking the check$/) do
  filtered_pupils = generate_pins_overview_page.pupil_list.rows.map {|row| row.name.text.split(' Date')[0]}.compact
  expect(@pupil_group_array - [@excluded_pupil]).to eql filtered_pupils
end

Given(/^I have generated pins for all pupils in a group$/) do
  step 'I have a group of pupils'
  step 'I choose to filter via group on the generate pins page'
  step 'I should only see pupils from the group'
  view_and_custom_print_live_check_page.load
  if view_and_custom_print_live_check_page.has_pupil_list?
    @before_pin_gen = view_and_custom_print_live_check_page.pupil_list.rows.size
  else
    @before_pin_gen =  0
  end
  generate_pins_overview_page.load
  step 'I click Generate PINs button'
  group = generate_pins_overview_page.group_filter.groups.find {|group| group.name.text.include? @group_name}
  group.checkbox.click
  generate_pins_overview_page.select_all_pupils.click
  generate_pins_overview_page.sticky_banner.confirm.click
  expect(view_and_custom_print_live_check_page.pupil_list.rows.size).to eql @before_pin_gen + @pupil_group_array.size
  pupil_pin_row = view_and_custom_print_live_check_page.pupil_list.rows.find {|row| row.name.text.include?(@pupil_group_array[1])}
  @pupil_credentials = {:school_password => pupil_pin_row.school_password.text, :pin => pupil_pin_row.pin.text}
  AzureTableHelper.wait_for_prepared_check(@pupil_credentials[:school_password],@pupil_credentials[:pin])
end

Given(/^I have generated familiarisation pins for all pupils in a group$/) do
  step 'I have a group of pupils'
  step 'I choose to filter via group on the generate pins familiarisation page'
  step 'I should only see pupils from the group'
  step 'I should be able to generate pins for all pupils in this group'
end

Then(/^I can no longer use this group to filter on the generate pins page$/) do
  generate_pins_overview_page.load
  generate_pins_overview_page.generated_pin_overview.generate_additional_pins_btn.click
  expect(generate_pins_overview_page.group_filter).to have_no_closed_filter
  expect(generate_pins_overview_page.group_filter).to have_no_opened_filter
end

Then(/^I should be able to filter by groups on the generate pins page$/) do
  view_and_custom_print_live_check_page.load
  view_and_custom_print_live_check_page.generate_more_pin_btn.click
  generate_pins_overview_page.group_filter.closed_filter.click unless generate_pins_overview_page.group_filter.has_opened_filter?
  group = generate_pins_overview_page.group_filter.groups.find {|group| group.name.text.include? @group_name}
  group.checkbox.click
  filtered_pupils = generate_pins_overview_page.pupil_list.rows.map {|row| row.name.text}.reject(&:empty?)
  expect(filtered_pupils).to eql [@pupil_group_array.first]
end

And(/^I should be able to see a count of pupils$/) do
  group = generate_pins_overview_page.group_filter.groups.find {|group| group.name.text.include? @group_name}
  expect(group.count.text.scan(/\d/).join('').to_i).to eql @pupil_group_array.size
end

Then(/^I should see an error message stating the service is unavailable$/) do
  sleep 1
  REDIS_CLIENT. del 'checkWindow.sqlFindActiveCheckWindow'
  pupil_register_page.load
  generate_pins_overview_page.load
  expect(page).to have_content("The service is unavailable")
end

Then(/^I should see related content on the generate pins page$/) do
  expect(generate_pins_overview_page).to have_related_heading
  expect(generate_pins_overview_page).to have_guidance
  expect(generate_pins_overview_page).to have_group_pupil
end

Then(/^I should see generated pin page as per design$/) do
  step 'I should see the school password for teacher1'
end

And(/^the displayed school password is generated as per the requirement$/) do
  step 'the school password should consist of 8 characters'
  step "the school password should not contain charachter 'q'"
  step 'school password should be generated from the specified pool of characters'
end

Then(/^I should see that I should not be able to generate a pin$/) do
  expect(school_landing_page).to have_generate_pupil_pin_disabled
end

Given(/^I want to generate pins for a group of (\d+) pupils with (.+)$/) do |total_pins, teacher|
  teacher_details = SqlDbHelper.find_teacher(teacher)
  @group_name = "multiple_pupil_group" + rand(2335234).to_s
  SqlDbHelper.create_group(@group_name,teacher_details['school_id'])
  @total_pins = total_pins.to_i
  step "I have logged in with #{teacher}"
  view_and_custom_print_live_check_page.load
  @before_pin_gen = view_and_custom_print_live_check_page.pupil_list.rows.size
  step "I am on the add multiple pupil page"
  @upn_list = add_multiple_pupil_page.create_and_upload_multiple_pupils(@total_pins,'pin_gen.csv')
  pupil_ids = @upn_list.map {|upn| SqlDbHelper.pupil_details(upn)['id']}
  group_id = SqlDbHelper.find_group(@group_name)['id']
  pupil_ids.each {|id| SqlDbHelper.add_pupil_to_group(group_id, id)}
  step "I am on the generate pupil pins page"
  step "I click Generate PINs button"
end

When(/^I select all (\d+) pupils$/) do |arg|
  group = generate_pins_overview_page.group_filter.groups.find {|group| group.name.text.include? @group_name}
  group.checkbox.click
  generate_pins_overview_page.select_all_pupils.click
  expect(generate_pins_overview_page.sticky_banner.selected_count.text.to_i).to eql @total_pins
  generate_pins_overview_page.sticky_banner.confirm.click
end

Then(/^I should be able to generate pins$/) do
  expect(current_url).to include '/view-and-custom-print-live-pins'
  expect(view_and_custom_print_live_check_page.pupil_list.rows.size).to eql @total_pins + @before_pin_gen
end


Given(/^I am on the generate pupil pins page after logging in with teacher2$/) do
  expect(REDIS_CLIENT.get("checkWindow.sqlFindActiveCheckWindow")).to be_nil
  step "I have signed in with teacher2"
  expect(school_landing_page).to be_displayed
  Timeout.timeout(20) {visit current_url until REDIS_CLIENT.get("checkWindow.sqlFindActiveCheckWindow") != nil}
  expect(JSON.parse(JSON.parse(REDIS_CLIENT.get("checkWindow.sqlFindActiveCheckWindow"))['value'])['recordset']).to be_empty
end
