
And(/^I am on the generate pupil pins page$/) do
  generate_pupil_pins_page.load
end

And(/^I navigate to generate pupil pins page$/) do
  school_landing_page.generate_pupil_pin.click
end

Then(/^I should see a heading for the Generate Pupil Pins$/) do
  expect(generate_pupil_pins_page).to have_heading
end

And(/^I can see the info message for generating the pupil pin$/) do
  expect(generate_pupil_pins_page).to have_generate_pin_message
  expect(generate_pupil_pins_page.info_message.map {|message| message.text}).to include "Generate pupil Personal Identification Numbers (PINs) and a school password."
  expect(generate_pupil_pins_page.info_message.map {|message| message.text}).to include "Distribute the PINs and password to your pupils."
end

And(/^I click Generate PINs button$/) do
  generate_pupil_pins_page.generate_pin_btn.click
end

Then(/^I should see a list of pupils sorted by surname on Generate Pins List Page$/) do
  pupils_from_page = generate_pupil_pins_page.pupil_list.rows.map {|x| x.name.text}
  sorted_pupils_from_page = generate_pupil_pins_page.pupil_list.rows.map {|x| x.name.text}.sort
  expect(sorted_pupils_from_page).to match_array(pupils_from_page)
end

Given(/^I have a pupil with active pin$/) do
  name = (0...8).map {(65 + rand(26)).chr}.join
  step "I am on the add pupil page"
  step "I submit the form with the name fields set as #{name}"
  step "the pupil details should be stored"
  @pupil_forename = @details_hash[:first_name]
  MongoDbHelper.set_pupil_pin(@details_hash[:first_name], @details_hash[:last_name], 9991001, "abc12345")
end

Given(/^I have a pupil not taking the check$/) do
  step 'I am on the pupil reason page'
  step 'I add Absent as a reason for a particular pupil'
  step 'the Absent reason should be stored against the pupils'
end

Then(/^I CANNOT see this pupil in the list of Pupil on Generate Pin list page$/) do
  pupils_from_page = generate_pupil_pins_page.pupil_list.rows.map {|x| x.name.text}
  expect(pupils_from_page.include?(@pupil_forename)).to be_falsy, "#{@pupil_forename} is displayed in the list ... Expected - It Shouldn't"
end