
Then(/^I should see the breadcrumb as "([^"]*)"$/) do |breadcrumb|
  @breadcrumb = breadcrumb
  expect(profile_page.breadcrumb_v2.text).to eq(@breadcrumb.gsub(' > ', "\n")) unless Capybara.current_driver.to_s.include? 'bs_'
  expect(profile_page.breadcrumb_v2.text).to eq(@breadcrumb.gsub(' > ', " ")) if Capybara.current_driver.to_s.include? 'ie11'
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


And(/^I navigate to the live check overview page$/) do
  generate_live_pins_overview_page.load
end

And(/^I navigate to the tio check overview page$/) do
  generate_tio_pins_overview_page.load
end


When(/^I navigate to the cookies form page$/) do
  cookies_form_page.load
end
