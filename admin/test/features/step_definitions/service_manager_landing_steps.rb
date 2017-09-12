Then(/^I should be taken to the service manager homepage$/) do
  expect(admin_page).to be_displayed
  expect(admin_page).to have_heading
end

Given(/^I am logged in with a test developer$/) do
  sign_in_page.load
  sign_in_page.login('test-developer', 'password')
end

Then(/^I should be given the option to manage check windows$/) do
  expect(admin_page).to have_manage_check_windows
  expect(admin_page).to have_manage_check_windows_text
end

Then(/^I should be given the option to adjust question timings$/) do
  expect(admin_page).to have_check_settings
  expect(admin_page).to have_check_settings_text
end

Then(/^I should be given the option to view progress reports$/) do
  expect(admin_page).to have_view_progress_reports
  expect(admin_page).to have_view_progress_reports_text
end

Then(/^I should be given the option to manage retake requests$/) do
  expect(admin_page).to have_manage_retake_requests
  expect(admin_page).to have_manage_retake_requests_text
end

Then(/^I should be given some guidance$/) do
  expect(admin_page).to have_guidance
end