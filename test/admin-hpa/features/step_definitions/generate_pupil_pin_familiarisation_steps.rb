And(/^I am on the generate pupil pins familiarisation page$/) do
  generate_pins_familiarisation_overview_page.load
end

Then(/^I should see generate pin familiarisation overview page as per design$/) do
  expect(generate_pins_familiarisation_overview_page).to have_heading
  expect(generate_pins_familiarisation_overview_page).to have_generate_pin_message
  expect(generate_pins_familiarisation_overview_page).to have_access_arrangment_text
  expect(generate_pins_familiarisation_overview_page).to have_access_arrangment_link
  expect(generate_pins_familiarisation_overview_page).to have_generate_pin_btn
end

And(/^I can see instructions for generating pin for familiarisation$/) do
  generate_pins_familiarisation_overview_page.instruction_section.toggle.click
  expect(generate_pins_familiarisation_overview_page.instruction_section.info_message[0].text).to include "Press 'Generate PINs' button."
  expect(generate_pins_familiarisation_overview_page.instruction_section.info_message[1].text).to include "Select which pupils you are generating pins for."
  expect(generate_pins_familiarisation_overview_page.instruction_section.info_message[2].text).to include "Distribute pupil PINs and school password to your pupils."
end

And(/^I click familiarisation Generate PINs button$/) do
  navigate_to_pupil_list_for_pin_gen('tio')
end

Then(/^I cannot see this pupil in the list of Pupil on Generate Pin familiarisation list page$/) do
  pupils_from_page = generate_pins_familiarisation_overview_page.pupil_list.rows.map {|x| x.name.text}
  expect(pupils_from_page.include?(@pupil_forename)).to be_falsy, "#{@pupil_forename} is displayed in the list ... Expected - It Shouldn't"
end

Then(/^I can see this pupil in the list of Pupil on Generate Pin familiarisation list page$/) do
  pupils_from_page = generate_pins_familiarisation_overview_page.pupil_list.rows.map {|x| x.name.text}
  expect(pupils_from_page.join.include?(@pupil_forename)).to be_truthy, "#{@pupil_forename} is Not displayed in the list ... Expected - It Should"
end

And(/^I am on familiarisation generate pins pupil list page$/) do
  navigate_to_pupil_list_for_pin_gen('tio')
  @page = generate_pins_overview_page
end

Then(/^I should see a list of pupils sorted by surname in '(.*)' order on familiarisation Generate Pins List Page$/) do |sort_order|
  if sort_order.eql?('descending')
    sorted_pupils_from_page = generate_pins_familiarisation_overview_page.pupil_list.rows.map {|x| x.name.text}.sort.reverse
  else
    sorted_pupils_from_page = generate_pins_familiarisation_overview_page.pupil_list.rows.map {|x| x.name.text}.sort
  end

  pupils_from_page = generate_pins_familiarisation_overview_page.pupil_list.rows.map {|x| x.name.text}
  expect(sorted_pupils_from_page).to match_array(pupils_from_page)
end

Then(/^I should be able to select them via a checkbox on familiarisation Generate Pin page$/) do
  generate_pins_familiarisation_overview_page.pupil_list.rows.each {|pupil| expect(pupil).to have_checkbox}
end

Then(/^I should have a option to select all pupils on familiarisation Generate Pin page$/) do
  expect(generate_pins_familiarisation_overview_page).to have_select_all_pupils
end

When(/^I click on the Pupil heading on familiarisation generate pin pupil list page$/) do
  generate_pins_familiarisation_overview_page.pupil_column_heading.click
end

When(/^I select a Pupil from familiarisation Generate Pin page$/) do
  step "I am on familiarisation generate pins pupil list page"
  pupil = generate_pins_familiarisation_overview_page.pupil_list.rows.find {|row| row.has_no_selected?}
  pupil.checkbox.click
end

When(/^I deselect all pupils from familiarisation Generate Pin Page$/) do
  generate_pins_familiarisation_overview_page.select_all_pupils.click
  expect(@page).to have_sticky_banner
  generate_pins_familiarisation_overview_page.select_all_pupils.click
end

When(/^I select multiple pupils from familiarisation Generate Pin Page$/) do
  @pupils = generate_pins_familiarisation_overview_page.pupil_list.rows.select {|row| row.has_no_selected?}
  @pupils[0..3].each {|pupil| pupil.checkbox.click}
  @pupil_names = @pupils[0..3].map {|pupil| pupil.name.text}
end

When(/^I have generated a familiarisation pin for a pupil$/) do
  name = (0...8).map {(65 + rand(26)).chr}.join
  step "I am logged in"
  step "I am on the add pupil page"
  step "I submit the form with the name fields set as #{name}"
  step "the pupil details should be stored"
  navigate_to_pupil_list_for_pin_gen('tio')
  @page = generate_pins_familiarisation_overview_page
  @pupil_name = generate_pins_familiarisation_overview_page.generate_pin_using_name(name)
end

Then(/^the familiarisation pin should consist of (\d+) characters$/) do |size|
  expect(custom_pins_familiarisation_page.find_pupil_row(@pupil_name).pin.text.size).to eql size.to_i
end

When(/^I click view all tio pins button$/) do
  generate_pins_familiarisation_overview_page.view_all_pins_btn.click
end

Then(/^familiarisation view and print pins page is displayed as per design$/) do
  expect(custom_pins_familiarisation_page).to have_heading
  expect(custom_pins_familiarisation_page).to have_pin_message
  expect(custom_pins_familiarisation_page).to have_pupil_list
end

Then(/^familiarisation generated pin overview page is displayed as per design$/) do
  expect(generate_pins_familiarisation_overview_page.generated_pin_overview).to be_all_there
end

Then(/^I should be taken to familiarisation pin overview page$/) do
  expect(generate_pins_familiarisation_overview_page).to be_displayed
end

Then(/^all pupil familiarisation pins should be generated from the specified pool of characters$/) do
  pins_array = custom_pins_familiarisation_page.pupil_list.rows.map {|pupil| pupil.pin.text}
  pins_array.each {|pin| pin.split('').each {|char| expect("23456789").to include char}}
end

And(/^the displayed familiarisation school password is generated as per the requirement$/) do
  step 'the familiarisation school password should consist of 8 characters'
  step "the familiarisation school password should not contain charachter 'q'"
  step 'familiarisation school password should be generated from the specified pool of characters'
end

Then(/^the familiarisation school password should consist of (\d+) characters$/) do |size|
  expect(custom_pins_familiarisation_page.find_pupil_row(@pupil_name).school_password.text.size).to eql size.to_i
end

Then(/^the familiarisation school password should not contain charachter 'q'$/) do
  school_pwd = custom_pins_familiarisation_page.find_pupil_row(@pupil_name).school_password.text
  school_pwd.split('').each {|char| expect(char.eql?('q')).to be_falsey, "'q' char is included in school password - #{school_pwd}"}
end

Then(/^familiarisation school password should be generated from the specified pool of characters$/) do
  school_pwd = custom_pins_familiarisation_page.find_pupil_row(@pupil_name).school_password.text
  school_pwd.split('').each {|char| expect("23456789abcdefghijklmnoprstuvwxyz").to include char}
end


When(/^I click Generate tio PINs button$/) do
  generate_pins_familiarisation_overview_page.generate_pins
end


And(/^I navigate to generate pupil pins familiarisation page$/) do
  school_landing_page.generate_passwords_and_pins.click
  tio_or_live_pins_page.generate_tio_pins.click
end

When(/^I choose to filter via group on the generate pins familiarisation page$/) do
  sleep 20
  navigate_to_pupil_list_for_pin_gen('tio')
  @page = generate_pins_familiarisation_overview_page
  generate_pins_familiarisation_overview_page.group_filter.closed_filter.click unless generate_pins_overview_page.group_filter.has_opened_filter?
  group = generate_pins_familiarisation_overview_page.group_filter.groups.find {|group| group.name.text.include? @group_name}
  group.checkbox.click
end

Given(/^I have generated familiarisation pins for all pupils in a group$/) do
  step 'I have a group of pupils'
  step 'I choose to filter via group on the generate pins familiarisation page'
  step 'I should only see pupils from the group'
  step 'I should be able to generate pins for all pupils in this group'
end
