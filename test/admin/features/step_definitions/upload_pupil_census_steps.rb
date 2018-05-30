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
  expect(upload_pupil_census_page.uploaded_file).to be_all_there
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