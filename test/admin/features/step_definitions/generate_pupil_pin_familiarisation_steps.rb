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
  expect(pupils_from_page.include?(@pupil_forename)).to be_truthy, "#{@pupil_forename} is displayed in the list ... Expected - It Shouldn't"
end