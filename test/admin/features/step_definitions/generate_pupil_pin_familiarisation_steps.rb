And(/^I am on the generate pupil pins familiarisation page$/) do
  generate_pins_familiarisation_overview_page.load
end

Then(/^I should see generate pin familiarisation overview page as per design$/) do
  expect(generate_pins_familiarisation_overview_page).to have_heading
  expect(generate_pins_familiarisation_overview_page).to have_generate_pin_message
  expect(generate_pins_familiarisation_overview_page).to have_access_arrangment_text
  expect(generate_pins_familiarisation_overview_page).to have_access_arrangment_link
  expect(generate_pins_familiarisation_overview_page).to have_instruction_section
  expect(generate_pins_familiarisation_overview_page).to have_generate_pin_btn
end

And(/^I can see instructions for generating pin for familiarisation$/) do
  generate_pins_familiarisation_overview_page.instruction_section.toggle.click
  expect(generate_pins_familiarisation_overview_page.instruction_section.info_message[0].text).to include "Press 'Generate PINs' button."
  expect(generate_pins_familiarisation_overview_page.instruction_section.info_message[1].text).to include "Select which pupils you are generating pins for."
  expect(generate_pins_familiarisation_overview_page.instruction_section.info_message[2].text).to include "Distribute pupil PINs and school password to your pupils."
end

And(/^I click familiarisation Generate PINs button$/) do
  generate_pins_familiarisation_overview_page.generate_pin_btn.click if generate_pins_overview_page.has_generate_pin_btn?
  generate_pins_familiarisation_overview_page.generate_more_pin_btn.click if generated_pins_page.has_generate_more_pin_btn?
end

Then(/^I cannot see this pupil in the list of Pupil on Generate Pin familiarisation list page$/) do
  pupils_from_page = generate_pins_familiarisation_overview_page.pupil_list.rows.map {|x| x.name.text}
  expect(pupils_from_page.include?(@pupil_forename)).to be_falsy, "#{@pupil_forename} is displayed in the list ... Expected - It Shouldn't"
end

Then(/^I can see this pupil in the list of Pupil on Generate Pin familiarisation list page$/) do
  pupils_from_page = generate_pins_familiarisation_overview_page.pupil_list.rows.map {|x| x.name.text}
  expect(pupils_from_page.join.include?(@pupil_forename)).to be_truthy, "#{@pupil_forename} is Not displayed in the list ... Expected - It Should"
end

And(/^I am on familiarisation generate pins pupil List page$/) do
  step 'I navigate to generate pupil pins familiarisation page'
  step 'I click Generate PINs button'
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
  step "I am on the generate pupil pins familiarisation page"
  step "I click Generate PINs button"
  @page = generate_pins_familiarisation_overview_page
  @pupil_name = generate_pins_familiarisation_overview_page.generate_pin_using_name(name)

  ct = Time.now
  new_time = Time.new(ct.year, ct.mon, ct.day, 22, 00, 00, "+02:00").strftime("%Y-%m-%d %H:%M:%S.%LZ")
  SqlDbHelper.set_pupil_pin_expiry(@details_hash[:first_name], @details_hash[:last_name], 2, new_time)
  SqlDbHelper.set_school_pin_expiry('1001', new_time)

  step "I am on the generate pupil pins familiarisation page"
end

