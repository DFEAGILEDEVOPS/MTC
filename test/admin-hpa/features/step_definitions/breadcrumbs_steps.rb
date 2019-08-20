Then(/^I should see the breadcrumb as "([^"]*)"$/) do |breadcrumb|
  @breadcrumb = breadcrumb
  expect(profile_page.breadcrumb_v2.text).to eq(@breadcrumb.gsub(' > ', "\n")) if (@breadcrumb.include? 'Pupil register') || (@breadcrumb.include? 'Edit pupil') || (@breadcrumb.include? 'Pupils not taking the check') || (@breadcrumb.include? 'Restarts')
  expect(profile_page.breadcrumb.text).to eq(@breadcrumb) unless (@breadcrumb.include? 'Pupil register') || (@breadcrumb.include? 'Edit pupil') || (@breadcrumb.include? 'Pupils not taking the check') || (@breadcrumb.include? 'Restarts')
end

And(/^I click the Home link on breadcrumb$/) do
  profile_page.home_v2.click if (@breadcrumb.include? 'Pupil register') || (@breadcrumb.include? 'Edit pupil') || (@breadcrumb.include? 'Pupils not taking the check') || (@breadcrumb.include? 'Restarts')
  profile_page.home.click unless (@breadcrumb.include? 'Pupil register') || (@breadcrumb.include? 'Edit pupil') || (@breadcrumb.include? 'Pupils not taking the check') || (@breadcrumb.include? 'Restarts')
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
