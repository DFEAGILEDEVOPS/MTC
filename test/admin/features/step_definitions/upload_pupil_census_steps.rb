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