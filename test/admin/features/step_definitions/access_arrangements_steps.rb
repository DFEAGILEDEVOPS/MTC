
Given(/^I navigate to access arrangements page$/) do
  school_landing_page.access_arrangements.click
end

Then(/^the access arrangements page is displayed as per the design$/) do
  expect(access_arrangements_page).to have_heading
  expect(access_arrangements_page).to have_information
  expect(access_arrangements_page).to have_select_pupil_and_arrangement_btn
end