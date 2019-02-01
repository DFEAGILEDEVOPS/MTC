Given(/^I am on the declaration submitted page$/) do
  declaration_submitted_page.load
  @page = declaration_submitted_page
end

Then(/^I can see the declaration submitted page as per the design$/) do
  expect(@page).to have_heading
  expect(@page).to have_link_to_form
  expect(@page).to have_message
  expect(@page).to_not have_view_results
end

And(/^I have submitted the form with confirmation$/) do
  school_id = SqlDbHelper.find_teacher('teacher3')['school_id']
  SqlDbHelper.set_hdf_form_confirmed_status(school_id, 1)
end

And(/^I have submitted the form without confirmation$/) do
  school_id = SqlDbHelper.find_teacher('teacher3')['school_id']
  SqlDbHelper.set_hdf_form_confirmed_status(school_id, 0)
end

And(/^I click on view declaration form$/) do
  @page.link_to_form.click
end

Then(/^I am redirected to the declaration submitted form page$/) do
  expect(@page).to have_current_path("/attendance/submitted-form", ignore_query: true)
  @page = declaration_submitted_form_page
end

Then(/^I can see the declaration submitted form page confirmed as per the design$/) do
  expect(@page).to have_heading
  expect(@page).to have_details_confirmed_list
  expect(@page).to_not have_warning_notconfirmed_panel
end

Then(/^I can see the declaration submitted form page not confirmed as per the design$/) do
  expect(@page).to have_heading
  expect(@page).to_not have_details_confirmed_list
  expect(@page).to have_warning_notconfirmed_panel
end
