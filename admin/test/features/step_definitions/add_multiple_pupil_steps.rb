
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

When(/^I Upload a valid CSV file to add Multiple Pupil$/) do
  @upn = UpnGenerator.generate
  @pupil_name = (0...8).map {(65 + rand(26)).chr}.join
  pupil_detail_array = [@pupil_name, @pupil_name, @pupil_name, @upn, "22/05/2005", "Female"]

  add_multiple_pupil_page.upload_multiple_pupil(pupil_detail_array)
  add_multiple_pupil_page.save.click
end

And(/^I delete the Add Multiple Pupil CSV file$/) do
  FileUtils.rm(File.expand_path("#{File.dirname(__FILE__)}/../../data/multiple_pupils_template.csv"))
end