Given(/^I am on the pupil not taking check page$/) do
  step 'I am logged in'
  pupils_not_taking_check_page.load
end

Then(/^I should see the heading$/) do
  expect(pupils_not_taking_check_page).to have_heading
end

Then(/^I should see the info text$/) do
  expect(pupils_not_taking_check_page).to have_info_text
end

Then(/^I should see a way to add a reason$/) do
  expect(pupils_not_taking_check_page).to have_add_reason
end

Then(/^I should be able to go back to the top$/) do
  expect(pupils_not_taking_check_page).to have_back_to_top
end

Then(/^I should see a way to generate pins$/) do
  expect(pupils_not_taking_check_page).to have_generate_pins
end