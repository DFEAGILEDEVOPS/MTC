Given(/^I am on the upload pupil census page$/) do
  step 'I am logged in with a service manager'
  step 'I navigate to the upload pupil census page'
end

Then(/^I should see a heading on the pupil census page$/) do
  expect(upload_pupil_census_page).to have_heading
end

Then(/^I should see an option to upload a file$/) do
  expect(upload_pupil_census_page).to have_file_upload
end

Then(/^I should see upload and cancel buttons$/) do
  expect(upload_pupil_census_page).to have_upload
  expect(upload_pupil_census_page).to have_cancel
end

Then(/^I should see an area where it displays files uploaded$/) do
  expect(upload_pupil_census_page).to have_uploaded_title
end

When(/^I have chosen a file to submit$/) do
  driver = page.driver.browser
  driver.file_detector = lambda do |args|
    str = args.first.to_s
    str if File.exist?(str)
  end if Capybara.current_driver.to_s.include? 'bs_'
  @file_name = "pupil-census-data-#{rand(234243234234234)}.csv"
  @file_path = "data/fixtures/#{@file_name}"
  upload_pupil_census_page.create_unique_check_csv(@file_path,File.read(File.expand_path('data/fixtures/pupil-census-data.csv')))
  page.attach_file('csvPupilCensusFile', File.expand_path("#{@file_path}"))
  upload_pupil_census_page.upload.click
  upload_and_view_forms_page.delete_csv_file(@file_path)
end

Then(/^I should see the file uploaded$/) do
  expect(upload_pupil_census_page.uploaded_file.file.text).to include @file_path.split('/').last.split('.').first
  jobs = SqlDbHelper.get_jobs
  expect(jobs.last['jobInput']).to include @file_name.split('.').first
end

When(/^I have chosen a file with '(.*)' to submit$/) do |condition|
  upload_pupil_census_page.upload_pupil_census_data_with_duplicate_upn(condition)
  upload_pupil_census_page.upload.click
end

Then(/^I should see the completed status$/) do
  expect(upload_pupil_census_page.uploaded_file.file.text).to include @file_name.split('.').first
  actual_message = upload_pupil_census_page.uploaded_file.status.text
  expect(actual_message.include?('Completed')).to be_truthy, "Expected status: 'Completed' to be included in Actual Message: #{actual_message}"
end

Then(/^I should see the error status for the duplicate upn$/) do
  expected_message = "RequestError: Cannot insert duplicate key row in object 'mtc_admin.pupil' with unique index 'pupil_upn_uindex'. The duplicate key value is (A999999609170)."
  actual_message = upload_pupil_census_page.uploaded_file.status.text

  expect(actual_message.eql?(expected_message)).to be_truthy, "Expected Message: #{expected_message} does not match Actual: #{actual_message}"
end

Then(/^I should see the error status for the empty last name$/) do
  expected_message = "RequestError: Cannot insert the value NULL into column 'lastName', table 'mtc.mtc_admin.pupil'; column does not allow nulls. INSERT fails."
  actual_message = upload_pupil_census_page.uploaded_file.status.text

  expect(actual_message.eql?(expected_message)).to be_truthy, "Expected Message: #{expected_message} does not match Actual: #{actual_message}"
end

Then(/^I should see the error status for the empty first name$/) do
  expected_message = "RequestError: Cannot insert the value NULL into column 'foreName', table 'mtc.mtc_admin.pupil'; column does not allow nulls. INSERT fails."
  actual_message = upload_pupil_census_page.uploaded_file.status.text

  expect(actual_message.eql?(expected_message)).to be_truthy, "Expected Message: #{expected_message} does not match Actual: #{actual_message}"
end

Then(/^I should see the error status for the empty gender$/) do
  expected_message = "RequestError: Cannot insert the value NULL into column 'gender', table 'mtc.mtc_admin.pupil'; column does not allow nulls. INSERT fails."
  actual_message = upload_pupil_census_page.uploaded_file.status.text

  expect(actual_message.eql?(expected_message)).to be_truthy, "Expected Message: #{expected_message} does not match Actual: #{actual_message}"
end

Given(/^I have uploaded a pupil census file$/) do
  step 'I am on the upload pupil census page'
  step 'I have chosen a file to submit'
  step 'I should see the file uploaded'
end

When(/^I decide to remove the file$/) do
  upload_pupil_census_page.uploaded_file.remove.click
  upload_pupil_census_page.removal_modal.yes.click
end

Then(/^it should be removed and the status updated$/) do
  expect(upload_pupil_census_page).to have_removal_message
  expect(upload_pupil_census_page.uploaded_file.status.text).to eql 'Removed'
end

Given(/^the pupil census file has been removed$/) do
  step 'I am on the upload pupil census page'
  step 'I have chosen a file to submit'
  step 'I should see the file uploaded'
  step 'I decide to remove the file'
end

Then(/^the pupils should be removed from the register$/) do
  visit Capybara.app_host + '/sign-out'
  step 'I am logged in'
  pupil_register_page.load
  names = pupil_register_page.pupil_list.pupil_row.map {|row| row.names}
  expect(names).to_not include 'Surname9991001,Mohsen'
end