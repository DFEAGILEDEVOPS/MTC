Then(/^I should see a complete page heading$/) do
  expect(complete_page).to have_heading
end

Then(/^I should see some text stating i have completed the check$/) do
  complete_page.wait_for_complete_page
  expect(complete_page).to have_completion_text
  expect(complete_page).to have_feedback
end

Then(/^I should be able to sign out$/) do
  expect(complete_page).to have_sign_out
end

When(/^I choose to sign out$/) do
  complete_page.sign_out.click
end

Then(/^I should be taken back to the sign in page$/) do
  expect(sign_in_page).to be_displayed
end
