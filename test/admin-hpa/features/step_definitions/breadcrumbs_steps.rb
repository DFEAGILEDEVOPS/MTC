
Then(/^I should see the breadcrumb as "([^"]*)"$/) do |breadcrumb|
  @breadcrumb = breadcrumb
  expect(profile_page.breadcrumb_v2.text).to eq(@breadcrumb.gsub(' > ', "\n"))
end

And(/^I click the Home link on breadcrumb$/) do
  profile_page.home_v2.click
end

Then(/^I should be taken to the admin page$/) do
  expect(admin_page).to be_displayed
end

When(/^I am on the manage check windows page$/) do
  admin_page.manage_check_windows.click
end

When(/^I am on the pupils not taking check page$/) do
  school_landing_page.pupils_not_taking_check.click
end
