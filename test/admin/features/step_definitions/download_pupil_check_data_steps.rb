Given(/^I am on the download pupil check data page$/) do
  testdeveloper_landing_page.download_pupil_check_data.click
end

Then(/^download pupil check data page display information as per the design$/) do
  expect(download_pupil_check_data_page).to have_heading
  expect(download_pupil_check_data_page).to have_information
  expect(download_pupil_check_data_page).to have_generate_latest_files_button
end

When /^I click generate latest file$/ do
  download_pupil_check_data_page.generate_latest_files_button.click
end

Then /^I will not see the error message$/ do
  expect(download_pupil_check_data_page).not_to have_error_message
end