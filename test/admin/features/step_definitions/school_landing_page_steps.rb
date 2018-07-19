Then(/^I should see (.*)'s school name$/) do |teacher|
  school_id = SqlDbHelper.find_teacher(teacher)['school_id']
  school_name = SqlDbHelper.find_school(school_id)['name']
  expect(school_landing_page.heading.text).to eql "Multiplication tables check for " + school_name
end

Then(/^I should see the school name corresponding to that (.*)$/) do |dfe_number|
  school_name = SqlDbHelper.find_school_by_dfeNumber(dfe_number)['name']
  expect(school_landing_page.heading.text).to eql "Multiplication tables check for " + school_name
end

Given(/^I am on the school landing page$/) do
  step "I am logged in"
  expect(school_landing_page).to be_displayed
end

Then(/^I should see an option to go to the manage pupils area$/) do
  expect(school_landing_page).to have_manage_pupil_instructions
  school_landing_page.manage_pupil.click
  expect(manage_pupil_page).to be_displayed
end

Then(/^I should see an option to go to the submit the attendance register area$/) do
  expect(school_landing_page).to have_submit_attendance_register
  expect(school_landing_page).to have_submit_attendance_register_instructions
end

Then(/^I should see an option to view the results$/) do
  expect(school_landing_page).to have_results
  expect(school_landing_page).to have_results_text
end

When(/^I decide to logout$/) do
  school_landing_page.sign_out.click
end

Then(/^I am taken back to the login page$/) do
  p current_url
  expect(sign_in_page).to be_displayed
end

Then(/^I should see the related section$/) do
  expect(school_landing_page).to have_related
end

Then(/^I should see option to view guidance in the before you start section$/) do
  expect(school_landing_page).to have_guidance
end

Then(/^I should see option to manage check forms in the before you start section$/) do
  expect(school_landing_page.before_you_start).to have_manage_check_forms
end

Then(/^I should see (.*)'s name$/) do |teacher|
  expect(school_landing_page.teacher_name.text).to eql "Signed in as " + teacher
end

Then(/^I should see an option to view the pupil register$/) do
  expect(school_landing_page).to have_pupil_register
  expect(school_landing_page).to have_pupil_register_text
end

Then(/^I should see an option to group pupils$/) do
  expect(school_landing_page).to have_group_pupils
  expect(school_landing_page).to have_group_pupils_text
end

Then(/^I should see an option to select pupils not taking the check$/) do
  expect(school_landing_page).to have_pupils_not_taking_check
  expect(school_landing_page).to have_pupils_not_taking_check_text
end

Then(/^I should see an option to manage access arrangements$/) do
  expect(school_landing_page).to have_access_arrangements
  expect(school_landing_page).to have_access_arrangements_text
end

Then(/^I should see an option to generate pins$/) do
  expect(school_landing_page).to have_generate_pupil_pin
  expect(school_landing_page).to have_generate_pupil_pin_text
end

Then(/^I should see an option to manage restarts$/) do
  expect(school_landing_page).to have_restarts
  expect(school_landing_page).to have_restarts_text
end

Then(/^I should see an option to complete the hdf$/) do
  expect(school_landing_page).to have_hdf
  expect(school_landing_page).to have_hdf_text
end

Then(/^I should see a disabled option for the hdf$/) do
  expect(school_landing_page).to have_hdf_disabled
  expect(school_landing_page).to have_hdf_disabled_text
end

Then(/^I should see the school landing page matches design$/) do

  step "I should see an option to view the pupil register"
  step "I should see an option to group pupils"
  step "I should see an option to select pupils not taking the check"
  step "I should see an option to select pupils not taking the check"
  step "I should see an option to manage access arrangements"
  step "I should see an option to generate pins"
  step "I should see an option to manage restarts"
  step "I should see a disabled option for the hdf"
  step "I should see an option to view the results"
  step "I should see the related section"
  step "I should see option to view guidance in the before you start section"

end