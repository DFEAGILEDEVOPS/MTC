Given(/^I am on the confirm and submit page$/) do
  declaration_confirm_page.load
  @page = declaration_confirm_page
end

Then(/^I can see the confirm and submit page as per the design$/) do
  expect(@page).to have_heading
  expect(@page).to have_form
  expect(@page).to have_submit_button
  expect(@page).to have_cancel_button
end

When(/^I submit the form without ticking all three boxes$/) do
  @page.submit_invalid_confirmed
end

When(/^I submit the form with confirmation$/) do
  @page.submit_valid_confirmed
end

When(/^I submit the form without confirmation$/) do
  @page.submit_not_confirmed
end

Then(/^I can see a validation error for confirm boxes$/) do
  expect(@page).to have_error_summary
  expect(@page.error_summary.hdf_confirm.text).to eql "All three checkboxes must be selected to proceed with this option"
  expect(@page.error_messages.map{|message| message.text}).to include "All three checkboxes must be selected to proceed with this option"
end

Then(/^I am redirected to the submitted page$/) do
  expect(@page).to have_current_path("/attendance/submitted", ignore_query: true)
end