Given(/^I am on the Upload and View forms page$/) do
  upload_and_view_forms_page.load
end

Then(/^I should see a heading on Upload and View forms page$/) do
  expect(upload_and_view_forms_page).to have_heading
end

Then(/^I should have the option to upload new form$/) do
  expect(upload_and_view_forms_page).to have_upload_new_form
end

Given(/^I am on the Upload new forms page$/) do
  upload_and_view_forms_page.upload_new_form.click
end

Then(/^I should see a heading on Upload new form page$/) do
 expect(upload_and_view_forms_page).to have_new_form_heading
end

And(/^I can see sub heading '(.*)' on Upload new form Page$/) do|sub_heading|
  expect(upload_and_view_forms_page.new_form_sub_heading.map {|message| message.text}).to include "#{sub_heading}"
end

And(/^I can see the Info message on Upload new form Page$/) do
  expect(upload_and_view_forms_page.new_form_info_message.map {|message| message.text}).to include "Download the example Download form example (CSV)"
  expect(upload_and_view_forms_page.new_form_info_message.map {|message| message.text}).to include "Open file in a programme like Excel, OpenOffice or Google Sheets"
  expect(upload_and_view_forms_page.new_form_info_message.map {|message| message.text}).to include "Add check questions using the given format"
  expect(upload_and_view_forms_page.new_form_info_message.map {|message| message.text}).to include "Save as a CSV file on your computer"
  expect(upload_and_view_forms_page.new_form_info_message.map {|message| message.text}).to include "Select 'Choose file' button and navigate to the file on your computer"
  expect(upload_and_view_forms_page.new_form_info_message.map {|message| message.text}).to include "Choose the file(s) to upload"
end

And(/^I should have the option to choose a csv file for adding new forms$/) do
  expect(upload_and_view_forms_page).to have_chose_file
end
