Given(/^I am on the assign check window page$/) do
  testdeveloper_landing_page.assign_forms_to_check_windows.click
end

Then(/^I should see a heading for the page$/) do
  expect(assign_form_to_window_page).to have_heading
end

Then(/^I should see some information about the check form$/) do
  expect(assign_form_to_window_page).to have_information
end

Then(/^I should see check windows$/) do
  expect(assign_form_to_window_page.check_windows.rows.first).to have_name_of_window
end