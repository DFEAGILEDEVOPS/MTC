Then(/^I should see page heading$/) do
  expect(manage_check_window_page).to have_heading
end

Then(/^I should see page instructions$/) do
  expect(manage_check_window_page).to have_page_instructions
end

Then(/^I should see a option to create a new window$/) do
  expect(manage_check_window_page).to have_create_new_window
end

Then(/^I should see a panel with information about timings$/) do
  expect(manage_check_window_page).to have_panel
end

Then(/^I should see a table of check windows$/) do
  expect(manage_check_window_page).to have_windows_table
end

Then(/^I should see a option to get some guidance$/) do
  expect(manage_check_window_page).to have_guidance
end

Then(/^I should see a option to adjust the timings of the check$/) do
  expect(manage_check_window_page).to have_adjust_timings
end

Then(/^I should see a option to view the progress report$/) do
  expect(manage_check_window_page).to have_progress_report
end