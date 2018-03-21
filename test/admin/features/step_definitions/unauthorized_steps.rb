When(/^I try to view the admin page$/) do
  admin_page.load
end

Then(/^I should be shown the access unauthorized page$/) do
  expect(unauthorized_page).to be_displayed
  expect(unauthorized_page).to have_heading
  expect(unauthorized_page).to have_info_text
  expect(unauthorized_page).to have_back_to_home
end

When(/^I try to view the school landing page$/) do
  school_landing_page.load
end

Given(/^I am on the unauthorized access page as a teacher$/) do
  step "I have logged in with teacher1"
  admin_page.load
end

When(/^I decide to return to the homepage$/) do
  unauthorized_page.back_to_home.click
end

Given(/^I am on the unauthorized access page as a service manager$/) do
  step "I have signed in with service-manager"
  school_landing_page.load
end