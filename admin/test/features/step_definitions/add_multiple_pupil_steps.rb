
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
  expect(@page.info_message.map {|message| message.text}).to include "Download the example Pupil details template (CSV file)"
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
  pupil_detail_array = [@pupil_name, @pupil_name, @pupil_name, @upn, "05/22/2005", "F"]

  @upn2 = UpnGenerator.generate
  pupil_detail_array2 = [@pupil_name, @pupil_name, @pupil_name, @upn2, "05/22/2010", "M"]

  add_multiple_pupil_page.upload_multiple_pupil(pupil_detail_array, pupil_detail_array2)
  add_multiple_pupil_page.save.click
end

When(/^I Upload a CSV file with errors to add Multiple Pupil$/) do
  @upn = UpnGenerator.generate
  @pupil_name = (0...8).map {(65 + rand(26)).chr}.join
  pupil_detail_array = [@pupil_name, @pupil_name, @pupil_name, @upn, "30/12/2005", "FEMALE"]

  @upn2 = UpnGenerator.generate
  pupil_detail_array2 = [@pupil_name, @pupil_name, @pupil_name, @upn2, "05/22/2010", "M"]

  add_multiple_pupil_page.upload_multiple_pupil(pupil_detail_array, pupil_detail_array2)
  add_multiple_pupil_page.save.click
end

And(/^I delete the Add Multiple Pupil CSV file$/) do
  FileUtils.rm(File.expand_path("#{File.dirname(__FILE__)}/../../data/multiple_pupils_template.csv"))
end

And(/^I should see a flash message for the multiple pupil upload$/) do
  expect(pupil_register_page.add_multiple_pupil_info_message.text.include?('2 new pupils have been added')).to be_truthy, "Got the message: '#{pupil_register_page.add_multiple_pupil_info_message.text}'"
end

And(/^I can see the new pupil in the list$/) do
  hightlighted_rows = pupil_register_page.pupil_list.pupil_row.find_all{|row| row.has_edited_pupil?}
  hightlighted_row_list = hightlighted_rows.map{|x| x.names.text}
  expect(hightlighted_row_list).to include("#{@pupil_name}, #{@pupil_name} Date of birth: 22/05/2005")
  expect(hightlighted_row_list).to include("#{@pupil_name}, #{@pupil_name} Date of birth: 22/05/2010")
end

And(/^I can see the error message for adding Multiple Pupil$/) do
  expect(add_multiple_pupil_page.error_message.text.include?('Errors in your uploaded file')).to be_truthy, "Got the message: #{add_multiple_pupil_page.error_message.text}"
  expect(add_multiple_pupil_page.error_message.text.include?('Please download the file below which highlights the errors. Correct the errors and upload the updated file.')).to be_truthy, "Got the message: #{add_multiple_pupil_page.error_message.text}"
end

And(/^I can see link to download Error File$/) do
  expect(add_multiple_pupil_page).to have_error_csv_file
  expect(add_multiple_pupil_page.error_csv_file.text.include?('Pupil details file with errors')).to be_truthy, "Got Error file link Text : '#{add_multiple_pupil_page.error_csv_file.text}'"
end