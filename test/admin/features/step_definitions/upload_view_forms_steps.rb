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
  expect(upload_and_view_forms_page.new_form_info_message.map {|message| message.text}).to include "Download the example Check form example (CSV file)"
  expect(upload_and_view_forms_page.new_form_info_message.map {|message| message.text}).to include "Open file in a programme like Excel, OpenOffice or Google Sheets"
  expect(upload_and_view_forms_page.new_form_info_message.map {|message| message.text}).to include "Add check questions using the given format"
  expect(upload_and_view_forms_page.new_form_info_message.map {|message| message.text}).to include "Save as a CSV file on your computer"
  expect(upload_and_view_forms_page.new_form_info_message.map {|message| message.text}).to include "Select 'Choose file' button and navigate to the file on your computer"
  expect(upload_and_view_forms_page.new_form_info_message.map {|message| message.text}).to include "Choose the file(s) to upload"
end

And(/^I should have the option to choose a csv file for adding new forms$/) do
  expect(upload_and_view_forms_page).to have_chose_file
end

When(/^I upload a csv file$/) do
  @current_form_count = upload_and_view_forms_page.available_checks.rows.count
  step 'I am on the Upload new forms page'
  driver = page.driver.browser
  driver.file_detector = lambda do |args|
    str = args.first.to_s
    str if File.exist?(str)
  end if Capybara.current_driver.to_s.include? 'bs_'
  @file_name = "check-form-#{rand(234243234234234)}.csv"
  @file_path = "../data/fixtures/#{@file_name}"
  upload_and_view_forms_page.create_unique_check_csv(@file_path,File.read(File.expand_path('../data/fixtures/check-form-1.csv')) )
  page.attach_file('csvFile', File.expand_path("../fixtures/#{@file_path}"))
  upload_and_view_forms_page.upload.click
  upload_and_view_forms_page.delete_csv_file(@file_path)
end

Then(/^it should be added to the list of forms$/) do
  wait_until{(upload_and_view_forms_page.available_checks.rows.count).eql?(@current_form_count + 1)}
end

Then(/^I should see a flash message to state that new form is uploaded$/) do
  expect(upload_and_view_forms_page).to have_info_message
  check_row = upload_and_view_forms_page.available_checks.rows.find{|row| row.title.text == @file_name.split('.').first}
  expect(check_row.has_highlighted_row?).to be_truthy, "New uploaded form is not highlighted"
end

When(/^I decide to remove a check form/) do
  window = upload_and_view_forms_page.available_checks.rows.find {|chk| chk.has_remove_form?}
  @check_name = window.title.text
  window.remove_form.click
  upload_and_view_forms_page.modal.confirm.click
end

When(/^I want to remove a check form/) do
  window = upload_and_view_forms_page.available_checks.rows.find {|chk| chk.has_remove_form?}
  @check_name = window.title.text
  window.remove_form.click
end

Then(/^it should be removed from the list of check form$/) do
  expect(upload_and_view_forms_page.available_checks.rows.find {|chk| chk.text.include? @check_name}).to be_nil
  expect(SqlDbHelper.check_form_details(@check_name)['isDeleted']).to be_truthy
end

Then(/^the check form should not be removed$/) do
  expect(upload_and_view_forms_page.available_checks.rows.find {|chk| chk.text.include? @check_name}).to_not be_nil
  expect(SqlDbHelper.check_form_details(@check_name)['isDeleted']).to be_falsey
end

Then(/^I should see on the check forms are displayed in descending order of form name$/) do
  check_forms = upload_and_view_forms_page.available_checks.rows.map {|x| x.title.text.downcase}
  sorted_check_forms = upload_and_view_forms_page.available_checks.rows.map {|x| x.title.text.downcase}.sort.reverse
  expect(sorted_check_forms.eql?(check_forms)).to be_truthy, "Forms are not sorted"
end

When(/^I click on the check form title heading$/) do
  upload_and_view_forms_page.check_form_title_column_heading.click
end

Given(/^I attempt to upload a csv containing minus characters$/) do
  step "I am on the Upload new forms page"
  page.attach_file('csvFile', File.expand_path('data/minus-chars.csv'))
  upload_and_view_forms_page.upload.click
end

Then(/^I should see error messages stating why the csv has failed to upload$/) do
  expect(upload_and_view_forms_page.errors).to be_all_there
end

Given(/^I attempt to upload a csv containing letters$/) do
  step "I am on the Upload new forms page"
  page.attach_file('csvFile', File.expand_path('data/letters.csv'))
  upload_and_view_forms_page.upload.click
end

Given(/^I attempt to upload a csv containing a header row$/) do
  step "I am on the Upload new forms page"
  page.attach_file('csvFile', File.expand_path('data/header-row.csv'))
  upload_and_view_forms_page.upload.click
end

Given(/^I attempt to upload a csv containing more than (\d+) columns$/) do |arg|
  step "I am on the Upload new forms page"
  page.attach_file('csvFile', File.expand_path('data/3-columns.csv'))
  upload_and_view_forms_page.upload.click
end

Given(/^I attempt to upload a csv containing numbers greater than 12$/) do
  step "I am on the Upload new forms page"
  page.attach_file('csvFile', File.expand_path('data/greater-than-12.csv'))
  upload_and_view_forms_page.upload.click
end

Given(/^I attempt to upload a file that is not a csv format$/) do
  step "I am on the Upload new forms page"
  page.attach_file('csvFile', File.expand_path('data/format.txt'))
  upload_and_view_forms_page.upload.click
end

Given(/^I attempt to upload a csv containing decimal numbers$/) do
  step "I am on the Upload new forms page"
  page.attach_file('csvFile', File.expand_path('data/decimals.csv'))
  upload_and_view_forms_page.upload.click
end

Given(/^I attempt to upload a csv containing quotes around the row$/) do
  step "I am on the Upload new forms page"
  page.attach_file('csvFile', File.expand_path('data/quotes-around-row.csv'))
  upload_and_view_forms_page.upload.click
end

Given(/^I attempt to upload a csv containing quotes around the column values$/) do
  @current_form_count = upload_and_view_forms_page.available_checks.rows.count
  step "I am on the Upload new forms page"
  @file_name = "check-form-#{rand(234243234234234)}.csv"
  @file_path = "../data/fixtures/#{@file_name}"
  upload_and_view_forms_page.create_unique_check_csv(@file_path,File.read(File.expand_path('data/quotes-around-values.csv')) )
  page.attach_file('csvFile', File.expand_path("../fixtures/#{@file_path}"))
  upload_and_view_forms_page.upload.click
  upload_and_view_forms_page.delete_csv_file(@file_path)
end

Given(/^I attempt to upload a csv containing spaces around the column values$/) do
  @current_form_count = upload_and_view_forms_page.available_checks.rows.count
  step "I am on the Upload new forms page"
  @file_name = "check-form-#{rand(234243234234234)}.csv"
  @file_path = "../data/fixtures/#{@file_name}"
  upload_and_view_forms_page.create_unique_check_csv(@file_path,File.read(File.expand_path('data/spaces.csv')) )
  page.attach_file('csvFile', File.expand_path("../fixtures/#{@file_path}"))
  page.attach_file('csvFile', File.expand_path(@file_path))
  upload_and_view_forms_page.upload.click
end

Given(/^I am ready to upload a csv file$/) do
  step "I am on the Upload new forms page"
  page.attach_file('csvFile', File.expand_path('../data/fixtures/check-form-1.csv'))
end

But(/^I have removed it$/) do
  upload_and_view_forms_page.remove_upload.click
end

Then(/^it should not be available to be uploaded$/) do
  expect(upload_and_view_forms_page.upload.disabled?).to be_truthy, "File is not removed Or Upload button is not disabled"
end

Then(/^I should see no link to download an example usage report$/) do
  expect(upload_and_view_forms_page).to have_no_download_form_example_template
end

And(/^I attempt to upload the same csv again$/) do
  @current_form_count = upload_and_view_forms_page.available_checks.rows.count
  step 'I am on the Upload new forms page'
  driver = page.driver.browser
  driver.file_detector = lambda do |args|
    str = args.first.to_s
    str if File.exist?(str)
  end if Capybara.current_driver.to_s.include? 'bs_'
  @file_path = "../data/fixtures/#{@file_name}"
  upload_and_view_forms_page.create_unique_check_csv(@file_path,File.read(File.expand_path('../data/fixtures/check-form-1.csv')) )
  page.attach_file('csvFile', File.expand_path("../fixtures/#{@file_path}"))
  upload_and_view_forms_page.upload.click
  upload_and_view_forms_page.delete_csv_file(@file_path)
end

Then(/^I should see an error stating it has already been uploaded$/) do
  find('p', text: "'#{@file_name.split('.').first}' already exists. Rename and upload again.")
end