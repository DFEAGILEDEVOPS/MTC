
And(/^I am on the generate pupil pins page$/) do
  school_landing_page.generate_pupil_pin.click
  @page = generate_pupil_pins_page
end

Then(/^I should see a heading for the Generate Pupil Pins$/) do
  expect(generate_pupil_pins_page).to have_heading
end

And(/^I can see the info message for generating the pupil pin$/) do
  expect(@page.has_content?('Pupils will need a Personal Identification Number (PIN) and school password in order to start the check. These expire daily.')).to be_truthy, "Expected text: 'Pupils will need a Personal Identification Number (PIN) and school password in order to start the check. These expire daily.' ... Not found"
  expect(@page.info_message.map {|message| message.text}).to include "Generate pupil Personal Identification Numbers (PINs) and a school password."
  expect(@page.info_message.map {|message| message.text}).to include "Distribute the PINs and password to your pupils."
end