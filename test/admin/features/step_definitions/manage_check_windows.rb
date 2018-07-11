Then(/^manage check window page is displayed as the the design$/) do
  expect(manage_check_window_page).to have_heading
  expect(manage_check_window_page).to have_page_instructions
  expect(manage_check_window_page).to have_create_new_window
  expect(manage_check_window_page).to have_panel
  expect(manage_check_window_page).to have_windows_table
  expect(manage_check_window_page).to have_guidance
  expect(manage_check_window_page).to have_adjust_timings
  expect(manage_check_window_page).to have_progress_report
end

Then(/^windows in the past cannot be removed$/) do
  expired_window = manage_check_window_page.find_check_row('Past Development Phase')
  expired_window_greyed_out = manage_check_window_page.find_expired_check_row('Past Development Phase')
  expect(expired_window).to_not have_remove
  expect(expired_window_greyed_out).to have_check_name
  expect(expired_window_greyed_out).to have_admin_start_date
  expect(expired_window_greyed_out).to have_check_period
end

When(/^I decide to remove a window$/) do
  window = manage_check_window_page.windows_table.rows.find {|chk| chk.check_name.text.eql?(@check_window_hash[:check_name])}
  @check_name = window.check_name.text
  window.remove.click
  manage_check_window_page.modal.confirm.click
end

Then(/^it should be removed from the list of check windows$/) do
  expect(manage_check_window_page.windows_table.rows.find {|chk| chk.text.include? @check_name}).to be_nil
end

And(/^it should be removed from the database$/) do
  expect(SqlDbHelper.check_window_details(@check_name)['isDeleted']).to be_truthy
end

When(/^I want to remove a window$/) do
  window = manage_check_window_page.windows_table.rows.find {|chk| chk.check_name.text.eql?(@check_window_hash[:check_name])}
  @check_name = window.check_name.text
  window.remove.click
end

But(/^decide to cancel$/) do
  manage_check_window_page.modal.cancel.click
end

Then(/^the window should not be removed$/) do
  expect(manage_check_window_page.windows_table.rows.find {|chk| chk.text.include? @check_name}).to_not be_nil
  expect(SqlDbHelper.check_window_details(@check_name)['isDeleted']).to be_falsey
end

Given(/^I am viewing the modal$/) do
  step 'I am on the manage check windows page'
  step 'I want to remove a window'
end

Then (/^modal is displayed as per the design$/) do
  expect(manage_check_window_page.modal).to have_heading
  expect(manage_check_window_page.modal.heading.text).to eql 'Please confirm'

  expect(manage_check_window_page.modal).to have_content
  expect(manage_check_window_page.modal.content.text).to eql 'Are you sure you want to remove this?'

  expect(manage_check_window_page.modal).to have_cancel
  expect(manage_check_window_page.modal).to have_confirm
end

Then(/^the check name should be sorted a\-z by default$/) do
  windows_from_db = MongoDbHelper.check_windows.map{|a| a['checkWindowName']}
  windows_from_db = windows_from_db.reject(&:nil?)
  windows_from_page = manage_check_window_page.windows_table.rows.map {|row| row.check_name.text}
  expect(windows_from_db.sort).to eql windows_from_page
end

When(/^I choose to sort to z\-a$/) do
  manage_check_window_page.sort_desc.click
end

Then(/^the check name should be sorted z\-a by default$/) do
  windows_from_db = MongoDbHelper.check_windows.map{|a| a['checkWindowName']}
  windows_removed_empties = windows_from_db.reject(&:nil?)
  windows_from_page = manage_check_window_page.windows_table.rows.map {|row| row.check_name.text}
  expect(windows_removed_empties.sort.reverse).to eql windows_from_page
end