Given(/^I have navigated to an unhandled url$/) do
  visit ENV["PUPIL_BASE_URL"] + '/unhandled-url'
end

Then(/^the page not found page is displayed$/) do
  expect(page_not_found_page).to be_all_there
end

And(/^I should see a link to return to the MTC homepage$/) do
  page_not_found_page.homepage_link.click
  expect(sign_in_page).to be_displayed
end
