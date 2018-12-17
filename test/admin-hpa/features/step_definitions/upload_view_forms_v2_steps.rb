When(/^I am on the Upload and View forms page v2$/) do
  testdeveloper_landing_page.upload_and_view_forms.click
end

Then(/^I should see the page matches design$/) do
  expect(upload_and_view_forms_v2_page).to have_heading
  expect(upload_and_view_forms_v2_page).to have_info
  expect(upload_and_view_forms_v2_page).to have_upload_new_form
  expect(upload_and_view_forms_v2_page).to have_related
end

When(/^I select to upload a new form$/) do
  upload_and_view_forms_v2_page.upload_new_form.click
end

Then(/^the upload form page matches design$/) do
  expect(upload_new_forms_page).to have_heading
  expect(upload_new_forms_page).to have_download_form_example_template
  expect(upload_new_forms_page).to have_new_form_info_message
  expect(upload_new_forms_page).to have_chose_file
  expect(upload_new_forms_page).to have_live_check_form
  expect(upload_new_forms_page).to have_familiarisation_check_form
  expect(upload_new_forms_page).to have_upload
  expect(upload_new_forms_page).to have_cancel
end


And(/^I submit without selecting a type or a form$/) do
  upload_new_forms_page.upload.click
end


Then(/^I should see an error stating I need to select a form and a type$/) do
  expect(upload_new_forms_page.error_messages.map {|error| error.text}).to eql ["Select a file to upload", "Select live form or familiarisation form"]
end


When(/^I have uploaded a valid (.*) form$/) do |type|
  step 'I select to upload a new form'
  driver = page.driver.browser
  driver.file_detector = lambda do |args|
    str = args.first.to_s
    str if File.exist?(str)
  end if Capybara.current_driver.to_s.include? 'bs_'
  @file_name = "test-check-form-#{rand(234243234234234)}.csv"
  @file_path = "data/fixtures/#{@file_name}"
  upload_new_forms_page.create_unique_check_csv(@file_path, File.read(File.expand_path('data/fixtures/check-form-1.csv')))
  page.attach_file('csvFiles', File.expand_path("#{@file_path}"))
  upload_new_forms_page.send("#{type}_check_form").click
  upload_new_forms_page.upload.click
  upload_new_forms_page.delete_csv_file(@file_path)
end

Then(/^it should be tagged as a (.*) form$/) do |type|
  expect(SqlDbHelper.check_form_details(@file_name.split('.')[0])['isLiveCheckForm']).to be true if type == 'live'
  expect(SqlDbHelper.check_form_details(@file_name.split('.')[0])['isLiveCheckForm']).to be false if type == 'familiarisation'
end

And(/^I decide to overwrite the existing familiarisation form by uploading a new (.+) form$/) do |type|
  step 'I select to upload a new form'
  driver = page.driver.browser
  driver.file_detector = lambda do |args|
    str = args.first.to_s
    str if File.exist?(str)
  end if Capybara.current_driver.to_s.include? 'bs_'
  @overwrite_file_name = "test-check-form-#{rand(234243234234234)}.csv"
  @file_path = "data/fixtures/#{@overwrite_file_name}"
  upload_new_forms_page.create_unique_check_csv(@file_path, File.read(File.expand_path('data/fixtures/check-form-1.csv')))
  page.attach_file('csvFiles', File.expand_path("#{@file_path}"))
  upload_new_forms_page.send("#{type}_check_form").click
  upload_new_forms_page.upload.click
  upload_new_forms_page.confirm_overwrite.click
end


Then(/^the previous form should be replaced$/) do
  previous_familiarisation_form = SqlDbHelper.check_form_details(@file_name.split('.')[0])
  current_familiarisation_form = SqlDbHelper.check_form_details(@overwrite_file_name.split('.')[0])
  expect(previous_familiarisation_form['isDeleted']).to be true
  expect(current_familiarisation_form['isDeleted']).to be false
end


And(/^I decide to cancel overwriting the existing (.+) form$/) do |type|
  step 'I select to upload a new form'
  driver = page.driver.browser
  driver.file_detector = lambda do |args|
    str = args.first.to_s
    str if File.exist?(str)
  end if Capybara.current_driver.to_s.include? 'bs_'
  @overwrite_file_name = "test-check-form-#{rand(234243234234234)}.csv"
  @file_path = "data/fixtures/#{@overwrite_file_name}"
  upload_new_forms_page.create_unique_check_csv(@file_path, File.read(File.expand_path('data/fixtures/check-form-1.csv')))
  page.attach_file('csvFiles', File.expand_path("#{@file_path}"))
  upload_new_forms_page.send("#{type}_check_form").click
  upload_new_forms_page.upload.click
  upload_new_forms_page.cancel_overwrite.click
end

Then(/^the previous form should be not overwritten$/) do
  previous_familiarisation_form = SqlDbHelper.check_form_details(@file_name.split('.')[0])
  expect(previous_familiarisation_form['isDeleted']).to be false
end


When(/^I attempt to upload 2 (.+) forms$/) do |type|
  step 'I select to upload a new form'
  driver = page.driver.browser
  driver.file_detector = lambda do |args|
    str = args.first.to_s
    str if File.exist?(str)
  end if Capybara.current_driver.to_s.include? 'bs_'
  @file1_name = "test-check-form-#{rand(234243234234234)}.csv"
  @file1_path = "data/fixtures/#{@file1_name}"
  upload_new_forms_page.create_unique_check_csv(@file1_path, File.read(File.expand_path('data/fixtures/check-form-1.csv')))
  @file2_name = "test-check-form-#{rand(234243234234234)}.csv"
  @file2_path = "data/fixtures/#{@file2_name}"
  upload_new_forms_page.create_unique_check_csv(@file2_path, File.read(File.expand_path('data/fixtures/check-form-1.csv')))
  page.attach_file('csvFiles', [File.expand_path("#{@file1_path}"), File.expand_path("#{@file2_path}")])
  upload_new_forms_page.send("#{type}_check_form").click
  upload_new_forms_page.upload.click
end


Then(/^I should be shown a validation error$/) do
  expect(upload_new_forms_page.error_messages.map {|error| error.text}).to eql ["Select one familiarisation form for upload"]
end


Then(/^they should be saved and tagged as a live form$/) do
  expect(SqlDbHelper.check_form_details(@file1_name.split('.')[0])['isDeleted']).to be false
  expect(SqlDbHelper.check_form_details(@file1_name.split('.')[0])['isLiveCheckForm']).to be true
  expect(SqlDbHelper.check_form_details(@file2_name.split('.')[0])['isDeleted']).to be false
  expect(SqlDbHelper.check_form_details(@file2_name.split('.')[0])['isLiveCheckForm']).to be true
end


When(/^I attempt to upload a file that is not csv file$/) do
  step 'I select to upload a new form'
  driver = page.driver.browser
  driver.file_detector = lambda do |args|
    str = args.first.to_s
    str if File.exist?(str)
  end if Capybara.current_driver.to_s.include? 'bs_'
  @file_name = "test-check-form-#{rand(234243234234234)}.txt"
  @file_path = "data/fixtures/#{@file_name}"
  upload_new_forms_page.create_unique_check_csv(@file_path, File.read(File.expand_path('data/fixtures/check-form-1.csv')))
  page.attach_file('csvFiles', File.expand_path("#{@file_path}"))
  upload_new_forms_page.live_check_form.click
  upload_new_forms_page.upload.click
  upload_new_forms_page.delete_csv_file(@file_path)
end

Then(/^I should see an error stating the file is in an invalid format$/) do
  expect(upload_new_forms_page.error_messages.map {|error| error.text}).to eql ["#{@file_name.split('.')[0]} must be a CSV file"]
end

















