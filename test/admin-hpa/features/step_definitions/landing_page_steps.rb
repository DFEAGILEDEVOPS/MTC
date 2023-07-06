Given(/^I am on the profile page$/) do
  profile_page.load
end

Then(/^I should see a logo$/) do
  expect(profile_page).to have_logo
end

Then(/^I should see a title$/) do
  expect(profile_page).to have_heading
end

Then(/^I should see a link to manage check forms$/) do
  expect(profile_page).to have_manage_check_forms
end

When(/^I choose to manage check forms$/) do
  profile_page.manage_check_forms.click
end

Then(/^I should be taken to the manage check forms page$/) do
  expect(manage_check_forms_page).to be_displayed
end

When(/^I choose to add a pupil$/) do
  profile_page.add_pupil.click
end

Then(/^I should be taken to the add a pupil page$/) do
  expect(add_pupil_page).to be_displayed
end

Then(/^I should be taken to the Manage a pupil page$/) do
  expect(manage_pupil_page).to be_displayed
end

Then(/^I should be taken to the Pupil register page$/) do
  sleep 0.5
  expect(pupil_register_page).to be_displayed
end

When(/^I click Manage pupil link$/) do
 manage_pupil_page.load
end

When(/^I click Pupil Register link$/) do
  school_landing_page.pupil_register.click
end

Then(/^I should be taken to the Manage Check Window page$/) do
  expect(manage_check_window_page).to be_displayed
end
