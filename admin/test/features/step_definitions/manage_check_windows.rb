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

Then(/^windows in the past cannot be removed$/) do
  expired_window = manage_check_window_page.find_check_row('Check Window Test A')
  expired_window_greyed_out = manage_check_window_page.find_expired_check_row('Check Window Test A')
  expect(expired_window).to_not have_remove
  expect(expired_window_greyed_out).to have_check_name
  expect(expired_window_greyed_out).to have_admin_start_date
  expect(expired_window_greyed_out).to have_check_period
end

When(/^I decide to remove a window$/) do
  window = manage_check_window_page.windows_table.rows.find {|chk| chk.has_remove?}
  @check_name = window.check_name.text
  window.remove.click
  manage_check_window_page.modal.confirm.click
end

Then(/^it should be removed from the list of check windows$/) do
  expect(manage_check_window_page.windows_table.rows.find {|chk| chk.text.include? @check_name}).to be_nil
end

And(/^it should be removed from the database$/) do
  expect(MongoDbHelper.check_window_details(@check_name)['isDeleted']).to be_truthy
end

When(/^I want to remove a window$/) do
  window = manage_check_window_page.windows_table.rows.find {|chk| chk.has_remove?}
  @check_name = window.check_name.text
  window.remove.click
end

But(/^decide to cancel$/) do
  manage_check_window_page.modal.cancel.click
end

Then(/^the window should not be removed$/) do
  expect(manage_check_window_page.windows_table.rows.find {|chk| chk.text.include? @check_name}).to_not be_nil
  expect(MongoDbHelper.check_window_details(@check_name)['isDeleted']).to be_falsey
end

Given(/^I am viewing the modal$/) do
  step 'I am on the manage check windows page'
  step 'I want to remove a window'
end

Then(/^I should see an option to cancel$/) do
  expect(manage_check_window_page.modal).to have_cancel
end

Then(/^I should see an option to confirm$/) do
  expect(manage_check_window_page.modal).to have_confirm
end

Then(/^I should see the modal has a heading$/) do
  expect(manage_check_window_page.modal).to have_heading
  expect(manage_check_window_page.modal.heading.text).to eql 'Please confirm'
end

Then(/^I should see the modal has some text$/) do
  expect(manage_check_window_page.modal).to have_content
  expect(manage_check_window_page.modal.content.text).to eql 'Are you sure you want to remove this?'

end