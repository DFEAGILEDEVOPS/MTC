Given(/^I am on the sign in page$/) do
  sign_in_page.load
end

Then(/^I should see a page heading$/) do
  expect(sign_in_page).to have_heading
end

Then(/^I should see instructions$/) do
  expect(sign_in_page).to have_instructions
end

Given(/^I have entered valid credentials$/) do
  sign_in_page.load
  sign_in_page.enter_credentials(@username, 'password')
end

When(/^I sign in$/) do
  sign_in_page.sign_in.click
end

Given(/^I have entered invalid credentials$/) do
  sign_in_page.load
  sign_in_page.enter_credentials(@username, 'wrong')
end

Then(/^I should be taken to the failed login page$/) do
  expect(sign_in_failure_page).to be_displayed
end

Given(/^I am logged in$/) do
  sign_in_page.load
  @user = @username
  sign_in_page.login(@user, 'password')
end

Then(/^I should be taken to the school landing page$/) do
  expect(school_landing_page).to be_displayed
end

Given(/^I have signed in with (.*)$/) do |teacher|
  @teacher = teacher
  sign_in_page.load
  sign_in_page.login(@teacher, 'password')
end

Given(/^I am on the sign in failure page$/) do
  sign_in_failure_page.load
end

When(/^I decide to get in contact$/) do
  sign_in_page.contact.click
end

Then(/^I should be taken to the contact page for mtc$/) do
  expect(contact_page).to be_displayed
end

Then(/^the sign in page should match design$/) do
  step 'I should see a page heading'
  step 'I should see instructions'
end

Given(/^I have logged in with (.*)$/) do |teacher|
  @teacher = teacher
  sign_in_page.load
  sign_in_page.login(@teacher, 'password')
end


Then(/^school ID or null should be recorded depnding if the user is linked to a school or not$/) do
  user = SqlDbHelper.find_teacher(@teacher)
  logon_event_school_id = SqlDbHelper.login_event(user['id']).map {|a| a['school_id']}.uniq
  expect(logon_event_school_id.size).to eql 1
  user_school_id = user['school_id']
  expect(user_school_id).to eql logon_event_school_id.first
end
