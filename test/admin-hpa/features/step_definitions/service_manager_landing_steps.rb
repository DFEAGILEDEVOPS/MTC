Then(/^I should be taken to the service manager homepage$/) do
  expect(admin_page).to be_displayed
  expect(admin_page).to have_heading
end

Given(/^I am logged in with a test developer$/) do
  sign_in_page.load
  sign_in_page.login('test-developer', 'password')
end

Given(/^I am logged in with a service manager$/) do
  sign_in_page.load
  sign_in_page.login('service-manager', 'password')
end

Then(/^I should be given the option to manage check windows$/) do
  expect(admin_page).to have_manage_check_windows
  expect(admin_page).to have_manage_check_windows_text
end

Then(/^I should be given the option to adjust settings on pupil check$/) do
  expect(admin_page).to have_pupil_check_settings
  expect(admin_page).to have_pupil_check_settings_text
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

Then(/^I should be taken to the Test Developer homepage$/) do
  expect(testdeveloper_landing_page).to be_displayed
  expect(testdeveloper_landing_page).to have_heading
end

Then(/^I should be given the option to upload and view forms$/) do
  expect(testdeveloper_landing_page).to have_upload_and_view_forms
  expect(testdeveloper_landing_page).to have_upload_and_view_forms_text
end

Then(/^I should be given the option to assign forms to check windows$/) do
  expect(testdeveloper_landing_page).to have_assign_forms_to_check_windows
  expect(testdeveloper_landing_page).to have_assign_forms_to_check_windows_text
end

Then(/^I should be given the option to manage access arangements$/) do
  expect(admin_page).to have_manage_access_arrangements
  expect(admin_page).to have_manage_access_arrangements_text
end

Then(/^I should be given the option to manage restart requests$/) do
  expect(admin_page).to have_manage_restart_requests
  expect(admin_page).to have_manage_restart_requests_text
end

Then(/^I should be given the option to upload pupil census data$/) do
  expect(admin_page).to have_upload_pupil_census
  expect(admin_page).to have_upload_pupil_census_text
end

When(/^I navigate to the upload pupil census page$/) do
  admin_page.upload_pupil_census.click
end

Then(/^I should be given the option to update mod schools$/) do
  expect(admin_page).to have_mod_schools_settings
  expect(admin_page).to have_mod_schools_settings_text
end

Then(/^I should be given the option to service messages$/) do
  expect(admin_page).to have_service_message
  expect(admin_page).to have_service_message_text
end

Then(/^I should be given the option to manage organisations/) do
  expect(admin_page).to have_school_search
  expect(admin_page).to have_school_search_text
end

Then(/^I should be given the option to search for pupils/) do
  expect(admin_page).to have_pupil_search
  expect(admin_page).to have_pupil_search_text
end

Then(/^I should be given the option to manage attendance codes/) do
  expect(admin_page).to have_manage_attendance_codes
  expect(admin_page).to have_manage_attendance_codes_text
end

And(/^the service managers homepage should match design$/) do
  step "I should see service-manager's name"
  step "I should be given the option to manage check windows"
  step "I should be given the option to upload pupil census data"
  step "I should be given the option to adjust settings on pupil check"
  step "I should be given the option to update mod schools"
  step "I should be given the option to service messages"
  step "I should be given some guidance"
  step "I should be given the option to manage organisations"
  step 'I should be given the option to manage attendance codes'
end
