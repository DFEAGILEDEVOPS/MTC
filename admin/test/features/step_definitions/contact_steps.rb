Given(/^I am on the contact page$/) do
  contact_page.load
end

Then(/^I should see contact details for MTC$/) do
  expect(contact_page).to have_heading
  expect(contact_page).to have_contact_information
end