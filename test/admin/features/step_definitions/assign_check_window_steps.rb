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

Then(/^I should not see '(.*)' check windows$/) do |check_window_name|
  check_found = false
  assign_form_to_window_page.check_windows.rows.each do|row|
    if row.name_of_window.text.include?(check_window_name)
      check_found = true
      break
    else
      check_found = false
    end
  end
  expect(check_found).to be_falsy, "Expected check window : '#{check_window_name}' to not appear in Assign check window list. Actual its displayed in the list"
end

And(/^the check window has started$/) do
  SqlDbHelper.update_check_window_start_date_to_past( @check_window_hash[:check_name])
end

Then(/^I should not be able to remove the check from the window$/) do
  window = assign_form_to_window_page.check_windows.rows.select {|check_window| check_window.name_of_window.text.include? @check_window_hash[:check_name]}
  window.first.name_of_window.click
  unassign_form_page.check_forms.rows.each{|row| expect(row).to have_no_remove_from_window}
end