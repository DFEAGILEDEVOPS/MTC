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

Then(/^I should see an upload button$/) do
  expect(upload_pupil_census_page).to have_upload
end

When(/^I have chosen a file to submit$/) do
  @file_name = "pupil-census-data-#{rand(234243234234234)}.csv"
  @file_path = "data/fixtures/#{@file_name}"

  dobs = add_multiple_pupil_page.get_dob_for_pupil_for_multiple_upload
  @old_date1 = dobs[0]
  @old_date2 = dobs[1]
  @upn = UpnGenerator.generate
  @pupil_name1 = (0...8).map {(65 + rand(26)).chr}.join
  pupil_detail_array = [@school['leaCode'].to_s, @school['estabCode'].to_s, @upn, @pupil_name1, @pupil_name1, @pupil_name1, "F", @old_date1]

  @upn2 = UpnGenerator.generate
  @pupil_name2 = (0...8).map {(65 + rand(26)).chr}.join
  pupil_detail_array2 = [@school['leaCode'].to_s, @school['estabCode'].to_s, @upn2, @pupil_name2, @pupil_name2, @pupil_name2, "M", @old_date2]
  upload_pupil_census_page.upload__pupil_census(@file_name, pupil_detail_array, pupil_detail_array2)
  upload_pupil_census_page.upload.click

  upload_and_view_forms_page.delete_csv_file(@file_path)
end

Then(/^I should see the file uploaded$/) do
  expect(view_jobs_page.message.text).to eql 'Pupil Census file has been uploaded'
  expect(view_jobs_page.job_history.rows.first.type.text).to eql 'Pupil Census'
  jobs = SqlDbHelper.get_jobs
  expect(jobs.last['jobInput']).to include @file_name.split('.').first
end

When(/^I have chosen a file with '(.*)' to submit$/) do |condition|
  upload_pupil_census_page.upload_pupil_census_data_with_duplicate_upn(condition)
  upload_pupil_census_page.upload.click
end

Then(/^I should see the completed status$/) do
  expect(view_jobs_page.job_history.rows.first.type.text).to eql "Pupil Census"
  wait_until {(visit current_url; view_jobs_page.job_history.rows.first.status.text == 'Completed')}
  begin
    wait_until(60){SqlDbHelper.get_jobs.last['jobStatus_id'].eql?(3)|| SqlDbHelper.get_jobs.last['jobStatus_id'].eql?(4)|| SqlDbHelper.get_jobs.last['jobStatus_id'].eql?(5)}
    status_id = SqlDbHelper.get_jobs.last['jobStatus_id']
    expect(status_id.eql?(3)).to be_truthy, "Actual Status _id is : #{status_id}"
  rescue
    raise "Last pupil census status stuck with Status_id: #{SqlDbHelper.get_jobs.last['jobStatus_id']}"
  end

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

Then(/^the pupil census should match design$/) do
  step 'I should see a heading on the pupil census page'
  step 'I should see an option to upload a file'
  step 'I should see an upload button'
  step 'I should see an option to download the template'
end


Then(/^I should see an option to download the template$/) do
  expect(upload_pupil_census_page).to have_download_template
  expect(upload_pupil_census_page.download_template.text).to eql 'Pupil census template (CSV, 0.05KB)'
end


When(/^I have chosen a file to submit that is not a CSV$/) do
  driver = page.driver.browser
  driver.file_detector = lambda do |args|
    str = args.first.to_s
    str if File.exist?(str)
  end if Capybara.current_driver.to_s.include? 'bs_'
  @file_name = "pupil-census-data-#{rand(234243234234234)}.txt"
  @file_path = "data/fixtures/#{@file_name}"
  upload_pupil_census_page.create_unique_check_csv(@file_path, File.read(File.expand_path('data/fixtures/pupil-census-data.csv')))
  page.attach_file('csvPupilCensusFile', File.expand_path("#{@file_path}"))
  upload_pupil_census_page.upload.click
  upload_and_view_forms_page.delete_csv_file(@file_path)
end


Then(/^I should see an error stating the file type must be CSV$/) do
  expect(upload_pupil_census_page.error_summary.error_messages.first.text).to eql 'Use a CSV file. See guidance for instructions.'
  expect(upload_pupil_census_page.error_message.text).to eql 'Use a CSV file. See guidance for instructions.'
end


When(/^I have not chosen a file to submit$/) do
  upload_pupil_census_page.upload.click
end


Then(/^I should see an error stating I need to select a file to upload$/) do
  expect(upload_pupil_census_page.error_summary.error_messages.first.text).to eql 'Select a file to upload'
  expect(upload_pupil_census_page.error_message.text).to eql 'Select a file to upload'
end

Given(/^I can see pupils that exist in the pupil register$/) do
  step "I am logged in"
  step "I am on the Pupil Register page"
end


When(/^I upload pupils via the census upload$/) do
  visit ENV['ADMIN_BASE_URL'] + '/sign-out'
  step 'I am on the upload pupil census page'
  step "I have chosen a file to submit"
  step "I should see the file uploaded"
  step "I should see the completed status"
end


Then(/^the newly uploaded pupils are visible in the pupil register list$/) do
  visit ENV['ADMIN_BASE_URL'] + '/sign-out'
  step "I can see pupils that exist in the pupil register"
  pupil_names_array = pupil_register_page.pupil_list.pupil_row.map {|row| row.names.text}
  expect(pupil_names_array).to include "#{@pupil_name1}, #{@pupil_name1}"
  expect(pupil_names_array).to include "#{@pupil_name2}, #{@pupil_name2}"
end


When(/^I upload pupils via the census upload using a temporary upn$/) do
  visit ENV['ADMIN_BASE_URL'] + '/sign-out'
  step 'I am on the upload pupil census page'
  @file_name = "pupil-census-data-#{rand(234243234234234)}.csv"
  @file_path = "data/fixtures/#{@file_name}"

  dobs = add_multiple_pupil_page.get_dob_for_pupil_for_multiple_upload
  @old_date1 = dobs[0]
  @old_date2 = dobs[1]
  @upn = UpnGenerator.generate_temporary
  @pupil_name1 = (0...8).map {(65 + rand(26)).chr}.join
  pupil_detail_array = [@school['leaCode'].to_s, @school['estabCode'].to_s, @upn, @pupil_name1, @pupil_name1, @pupil_name1, "F", @old_date1]

  @upn2 = UpnGenerator.generate
  @pupil_name2 = (0...8).map {(65 + rand(26)).chr}.join
  pupil_detail_array2 = [@school['leaCode'].to_s, @school['estabCode'].to_s, @upn2, @pupil_name2, @pupil_name2, @pupil_name2, "M", @old_date2]

  upload_pupil_census_page.upload__pupil_census(@file_name, pupil_detail_array, pupil_detail_array2)
  upload_pupil_census_page.upload.click

  upload_and_view_forms_page.delete_csv_file(@file_path)

  step "I should see the file uploaded"
  step "I should see the completed status"
end
