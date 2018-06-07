Given(/^I am on the download pupil check data page$/) do
  testdeveloper_landing_page.download_pupil_check_data.click
end

Then(/^I should see a heading for the download pupil check data page$/) do
  expect(download_pupil_check_data_page).to have_heading
end

Then(/^I should see some information about the download pupil check data$/) do
  expect(download_pupil_check_data_page).to have_information
end