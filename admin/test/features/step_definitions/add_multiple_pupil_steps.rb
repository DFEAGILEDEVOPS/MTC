
And(/^I am on the add multiple pupil page$/) do
  step 'I am on the Pupil Register page'
  pupil_register_page.add_multiple_pupil.click
  @page = add_multiple_pupil_page
end

Then(/^I should see a heading for the Add Multiple pupils$/) do
  expect(add_multiple_pupil_page).to have_heading
end

And(/^I can see sub heading '(.*)' on Add Multiple Pupil Page$/) do|sub_heading|
  expect(@page.sub_heading.map {|message| message.text}).to include "#{sub_heading}"
end

And(/^I can see the Info message on adding Multiple Pupils$/) do
  expect(@page.info_message.map {|message| message.text}).to include "Download the template Pupil details template (CSV file)"
  expect(@page.info_message.map {|message| message.text}).to include "Open file in a programme like Excel, OpenOffice or Google Sheets"
  expect(@page.info_message.map {|message| message.text}).to include "Add pupil details using the given format"
  expect(@page.info_message.map {|message| message.text}).to include "Save as a CSV file on your computer"
  expect(@page.info_message.map {|message| message.text}).to include "Select 'Choose file' button and navigate to the file on your computer"
  expect(@page.info_message.map {|message| message.text}).to include "Choose the file to upload"
end

And(/^I should have the option to choose a csv file for adding multiple pupil$/) do
  expect(@page).to have_chose_file
end