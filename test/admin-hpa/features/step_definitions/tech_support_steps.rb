Then(/^I should be taken to the tech support homepage$/) do
  expect(tech_support_page).to be_displayed
  expect(tech_support_page).to have_heading
end
