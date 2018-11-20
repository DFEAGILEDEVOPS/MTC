Given(/^I am on the assign check window page$/) do
  testdeveloper_landing_page.assign_forms_to_check_windows.click
end

Then(/^I should see assign check window page as per design$/) do
  expect(assign_form_to_window_page).to have_heading
  expect(assign_form_to_window_page).to have_information
  expect(assign_form_to_window_page.check_windows.rows.first).to have_name_of_window
end

Then(/^I should not see '(.*)' check windows$/) do |check_window_name|
  expect(assign_form_to_window_page.check_windows.rows.find {|row| row.name_of_window.text.include? check_window_name}).to be_nil
end

And(/^the check window has started$/) do
  SqlDbHelper.update_check_window_start_date_to_past( @check_window_hash[:check_name])
end

Then(/^I should not be able to remove the check from the window$/) do
  window = assign_form_to_window_page.check_windows.rows.select {|check_window| check_window.name_of_window.text.include? @check_window_hash[:check_name]}
  window.first.name_of_window.click
  unassign_form_page.check_forms.rows.each{|row| expect(row).to have_no_remove_from_window}
end