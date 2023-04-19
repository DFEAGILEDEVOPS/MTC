Given(/^I am on the confirm and submit page$/) do
  step 'I am on the review pupil detail page'
  declaration_review_pupils_page.continue_button.click
end

Then(/^I can see the confirm and submit page as per the design$/) do
  expect(declaration_confirm_page).to have_heading
  expect(declaration_confirm_page).to have_submit_button
  expect(declaration_confirm_page).to have_cancel_button
end

When(/^I submit the form without ticking all three boxes$/) do
  declaration_confirm_page.submit_invalid_confirmed
end

When(/^I submit the form with confirmation$/) do
  declaration_confirm_page.submit_valid_confirmed
end

When(/^I submit the form without confirmation$/) do
  declaration_confirm_page.submit_not_confirmed
end

Then(/^I can see a validation error for confirm boxes$/) do
  expect(declaration_confirm_page).to have_error_summary
  expect(declaration_confirm_page.error_summary.hdf_confirm.text).to eql "All four checkboxes must be selected to proceed with this option"
  expect(declaration_confirm_page.error_messages.map{|message| message.text}).to include "All four checkboxes must be selected to proceed with this option"
end

Then(/^I am redirected to the submitted page$/) do
  expect(declaration_confirm_page).to have_current_path("/attendance/submitted", ignore_query: true)
end
