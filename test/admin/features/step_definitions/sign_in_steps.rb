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
  sign_in_page.enter_credentials('teacher1','password')
end

When(/^I sign in$/) do
  sign_in_page.sign_in.click
end

Given(/^I have entered invalid credentials$/) do
  sign_in_page.load
  sign_in_page.enter_credentials('teacher1', 'wrong')
end

Then(/^I should be taken to the failed login page$/) do
  expect(sign_in_failure_page).to be_displayed
end

Given(/^I am logged in$/) do
  sign_in_page.load
  sign_in_page.login('teacher1', 'password')
end

Then(/^I should be taken to the school landing page$/) do
  expect(school_landing_page).to be_displayed
end

Given(/^I have signed in with (.*)$/) do |teacher|
  @teacher = teacher
  sign_in_page.load
  sign_in_page.login(@teacher,'password')
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