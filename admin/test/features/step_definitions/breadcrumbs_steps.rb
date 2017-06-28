Then(/^I should see the breadcrumb as "([^"]*)"$/) do |breadcrumb|
  expect(profile_page.breadcrumb.text).to eq(breadcrumb)
end

And(/^I click the Home link on breadcrumb$/) do
  profile_page.home.click
end