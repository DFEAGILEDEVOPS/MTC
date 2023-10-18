Given(/^the admin window is closed$/) do
  SqlDbHelper.update_check_end_date((Date.today) - 30)
  SqlDbHelper.update_admin_end_date((Date.today) - 30)
  REDIS_CLIENT. del 'checkWindow.sqlFindActiveCheckWindow'
end


And(/^read only mode is enabled by the service manager$/) do
  step "I have signed in with service-manager"
  admin_page.pupil_check_settings.click
  check_settings_page.read_only.click
  check_settings_page.save_changes.click

  visit ENV['ADMIN_BASE_URL'] + '/sign-out'
  visit ENV['ADMIN_BASE_URL']
end


Then(/^teachers can only have read only access$/) do
  step 'I am logged in'
  pupil_register_page.load
  expect(pupil_register_page).to have_no_add_pupil
  expect(pupil_register_page).to have_no_add_multiple_pupil
  pupils_not_taking_check_page.load
  find(".govuk-button--disabled", text: 'Select pupils and reason')
  access_arrangements_page.load
  expect(access_arrangements_page).to have_no_select_pupil_and_arrangement_btn
  generate_live_pins_overview_page.load
  expect(generate_live_pins_overview_page.generate_pin_btn).to be_disabled
  generate_tio_pins_overview_page.load
  expect(generate_tio_pins_overview_page.generate_pin_btn).to be_disabled
  school_landing_page.load
  find(".govuk-disabled-link", text: "Organise pupils into groups")
  find(".govuk-disabled-link", text: "See how many of your pupils have completed the official check")
  find(".govuk-disabled-link", text: "Select pupils to restart the check")
  find(".govuk-disabled-link", text: "Complete the headteacher’s declaration form")
end


And(/^service unavailable mode is enabled by the service manager$/) do
  step "I have signed in with service-manager"
  admin_page.pupil_check_settings.click
  check_settings_page.unavailable.click
  check_settings_page.save_changes.click
  visit ENV['ADMIN_BASE_URL'] + '/sign-out'
  visit ENV['ADMIN_BASE_URL']
end


Then(/^teachers should see the service unavailable page$/) do
  step 'I am logged in'
  expect(page.text).to include "\nThe multiplication tables check service is currently closed\nThe multiplication tables check service opens on Monday 8 April 2024 for maintained schools, special schools and academies (including free schools) with year 4 pupils.\nFurther information is available on GOV.UK: https://www.gov.uk/government/collections/multiplication-tables-check\nSign out"
end
