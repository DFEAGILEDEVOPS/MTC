Then(/^I should see (.*)'s school name$/) do |teacher|
  school_id = SqlDbHelper.find_teacher(teacher)[0]['school_id']
  school_name = SqlDbHelper.find_school(school_id)['name']
  expect(school_landing_page.heading.text).to eql "Multiplication tables check for " + school_name
end

Given(/^I am on the school landing page$/) do
  step "I am logged in"
  expect(profile_page.breadcrumb.text).to eq("School Home")
end

Then(/^I should see some instructions on what to do next$/) do
  expect(school_landing_page).to have_instructions
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
  expect(school_landing_page).to have_results_instructions
end

When(/^I decide to logout$/) do
  school_landing_page.sign_out.click
end

Then(/^I am taken back to the login page$/) do
  expect(sign_in_page).to be_displayed
end

Then(/^I should see the before you start section$/) do
  expect(school_landing_page).to have_before_you_start
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