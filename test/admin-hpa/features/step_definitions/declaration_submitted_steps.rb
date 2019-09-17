Given(/^I am on the declaration submitted page$/) do
  step 'I am on the confirm and submit page'
  step 'I submit the form with confirmation'
end

Given(/^I am on the declaration submitted page with HDF submitted with unconfirmed status$/) do
  step 'I am on the confirm and submit page'
  step 'I submit the form without confirmation'
end

Then(/^I can see the declaration submitted page as per the design$/) do
  expect(declaration_submitted_page).to have_heading
  expect(declaration_submitted_page).to have_link_to_form
  expect(declaration_submitted_page).to have_message
  expect(declaration_submitted_page).to_not have_view_results
end

And(/^I click on view declaration form$/) do
  declaration_submitted_page.link_to_form.click
end

Then(/^I am redirected to the declaration submitted form page$/) do
  expect(declaration_submitted_page).to have_current_path("/attendance/submitted-form", ignore_query: true)
  @page = declaration_submitted_form_page
end

Then(/^I can see the declaration submitted form page confirmed as per the design$/) do
  expect(declaration_submitted_form_page).to have_heading
  expect(declaration_submitted_form_page).to have_details_confirmed_list
  expect(declaration_submitted_form_page).to_not have_warning_notconfirmed_panel
end

Then(/^I can see the declaration submitted form page not confirmed as per the design$/) do
  expect(declaration_submitted_form_page).to have_heading
  expect(declaration_submitted_form_page).to_not have_details_confirmed_list
  expect(declaration_submitted_form_page).to have_warning_notconfirmed_panel
end
