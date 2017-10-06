Given(/^I am on the confirmation page$/) do
  step 'I have logged in'
  step 'I should be taken to the confirmation page'
end

When(/^I attempt to refresh the page$/) do
  visit current_url
end

Then(/^I should remain on the confirmation page$/) do
  step 'I should be taken to the confirmation page'
end

Then(/^I should remain on the instructions page$/) do
  step 'I should be taken to the instructions page'
end
