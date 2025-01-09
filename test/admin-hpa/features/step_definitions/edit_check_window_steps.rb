And(/^I want to edit a previously added check$/) do
  step 'I am logged in with a service manager'
  step 'I am on the manage check windows page'
  manage_check_window_page.create_new_window.click
  @page = add_edit_check_window_page
  step 'I create new check window with valid data'
  check_window = manage_check_window_page.find_check_row(@check_window_name)
  check_window.check_name.click
end

And(/^I create new check window with valid data$/) do
  today_date = Date.today
  @admin_start_date = today_date + 30
  @check_start_date = today_date + 33
  @check_end_date = today_date + 35
  @check_window_name = "TestCheck-#{today_date.day}-#{today_date.month}-#{today_date.year}-#{rand(1..10000)}"
  @check_window_hash = {check_name: @check_window_name,
                        admin_start_day: @admin_start_date.day,
                        admin_start_mon: @admin_start_date.month,
                        admin_start_year: @admin_start_date.year + 5,
                        check_start_day: @check_start_date.day,
                        check_start_mon: @check_start_date.month,
                        check_start_year: @check_start_date.year + 5,
                        check_end_day: @check_end_date.day,
                        check_end_mon: @check_end_date.month,
                        check_end_year: @check_end_date.year + 5
  }
  @page.enter_details(@check_window_hash)
  @page.save_changes.click
end

When(/^I update the check window with valid data$/) do
  @admin_start_date = @admin_start_date + 1
  @check_start_date = @check_start_date + 1
  @check_end_date = @check_end_date + 1
  @updated_check_window_hash = {check_name: @check_window_name,
                                admin_start_day: @admin_start_date.day,
                                admin_start_mon: @admin_start_date.month,
                                admin_start_year: @admin_start_date.year,
                                check_start_day: @check_start_date.day,
                                check_start_mon: @check_start_date.month,
                                check_start_year: @check_start_date.year,
                                check_end_day: @check_end_date.day,
                                check_end_mon: @check_end_date.month,
                                check_end_year: @check_end_date.year
  }
  @page.enter_details(@updated_check_window_hash)
  @page.save_changes.click
end

Then(/^I would see the edit check fields prepopulated with the data$/) do
  expect(@page.check_name.value.eql?(@check_window_hash[:check_name])).to be_truthy, "Expected CheckName: #{@check_window_hash[:check_name]}...But Actual: #{@page.check_name.value}"
  expect(@page.admin_start_day.value.eql?(@check_window_hash[:admin_start_day]).to_s).to be_truthy, "Expected Admin Start Day: #{@check_window_hash[:admin_start_day]}...But Actual: #{@page.admin_start_day.value}"
  expect(@page.admin_start_month.value.eql?(@check_window_hash[:admin_start_mon]).to_s).to be_truthy, "Expected Admin Start Month: #{@check_window_hash[:admin_start_mon]}...But Actual: #{@page.admin_start_month.value}"
  expect(@page.admin_start_year.value.eql?(@check_window_hash[:admin_start_year]).to_s).to be_truthy, "Expected Admin Start Year: #{@check_window_hash[:admin_start_year]}...But Actual: #{@page.admin_start_year.value}"
  expect(@page.check_start_day.value.eql?(@check_window_hash[:check_start_day]).to_s).to be_truthy, "Expected Check Start Day: #{@check_window_hash[:check_start_day]}...But Actual: #{@page.check_start_day.value}"
  expect(@page.check_start_month.value.eql?(@check_window_hash[:check_start_mon]).to_s).to be_truthy, "Expected Check Start Month: #{@check_window_hash[:check_start_mon]}...But Actual: #{@page.check_start_month.value}"
  expect(@page.check_start_year.value.eql?(@check_window_hash[:check_start_year]).to_s).to be_truthy, "Expected Check Start Year: #{@check_window_hash[:check_start_year]}...But Actual: #{@page.check_start_year.value}"
  expect(@page.check_end_day.value.eql?(@check_window_hash[:check_end_day]).to_s).to be_truthy, "Expected Check End Day: #{@check_window_hash[:check_end_day]}...But Actual: #{@page.check_end_day.value}"
  expect(@page.check_end_month.value.eql?(@check_window_hash[:check_end_mon]).to_s).to be_truthy, "Expected Check End Month: #{@check_window_hash[:check_end_mon]}...But Actual: #{@page.check_end_month.value}"
  expect(@page.check_end_year.value.eql?(@check_window_hash[:check_end_year]).to_s).to be_truthy, "Expected Check End Year: #{@check_window_hash[:check_end_year]}...But Actual: #{@page.check_end_year.value}"
end

And(/^I should see a flash message to state the check window has been updated$/) do
  expect(manage_check_window_page).to have_info_message
end

And(/^I should see no flash message to update check window is displayed$/) do
  expect(manage_check_window_page).to have_no_info_message
end

And(/^the updated Check Window Detail is Saved$/) do
  wait_until {!(SqlDbHelper.check_window_details(@check_window_name.to_s)).nil?}
  @stored_pupil_details = SqlDbHelper.check_window_details @check_window_name.to_s
  expect(@updated_check_window_hash[:check_name]).to eql @stored_pupil_details['name']
end

But(/^decide against editing it$/) do
  add_edit_check_window_page.back.click
end

When(/^I try to update without a admin start date for the window$/) do
  add_edit_check_window_page.admin_start_day.set ''
  add_edit_check_window_page.admin_start_month.set ''
  add_edit_check_window_page.admin_start_year.set ''
  add_edit_check_window_page.save_changes.click
end

When(/^I try to update without a check start date for the window$/) do
  add_edit_check_window_page.check_start_day.set ''
  add_edit_check_window_page.check_start_month.set ''
  add_edit_check_window_page.check_start_year.set ''
  add_edit_check_window_page.save_changes.click
end

Given(/^I navigate to the manage check windows page$/) do
  step 'I am logged in with a service manager'
  step 'I am on the manage check windows page'
end

Given(/^I want to edit a check window that is in the past$/) do
  step 'I navigate to the manage check windows page'
  past_window = manage_check_window_page.windows_table.rows.find {|row| row.status.text == 'Past'}
  past_window.check_name.click
end

Then(/^I should not be able to make any changes to any start dates$/) do
  expect(add_edit_check_window_v2_page.disabled_fields.count).to eql 3
end

Given(/^I want to view a check window that is currently active$/) do
  step 'I navigate to the manage check windows page'
  active_window = manage_check_window_page.windows_table.rows.find {|row| row.status.text == 'Active'}
  active_window.check_name.click
end

Then(/^I should only be able to edit dates that are in the future$/) do
  expect(add_edit_check_window_v2_page.disabled_fields.count).to eql 3
  expect(add_edit_check_window_v2_page).to have_check_name
  expect(add_edit_check_window_v2_page).to have_admin_end_day
  expect(add_edit_check_window_v2_page).to have_admin_end_month
  expect(add_edit_check_window_v2_page).to have_admin_end_year
  expect(add_edit_check_window_v2_page).to have_familiarisation_check_end_day
  expect(add_edit_check_window_v2_page).to have_familiarisation_check_end_month
  expect(add_edit_check_window_v2_page).to have_familiarisation_check_end_year
  expect(add_edit_check_window_v2_page).to have_live_check_end_day
  expect(add_edit_check_window_v2_page).to have_live_check_end_month
  expect(add_edit_check_window_v2_page).to have_live_check_end_year
end

And(/^I decide to edit it$/) do
  @check_window.check_name.click
end

When(/^I try submit the form with no dates$/) do
  @check_window_hash = {check_name: '',
                        admin_start_day: '',
                        admin_start_month: '',
                        admin_start_year: '',
                        admin_end_day: '',
                        admin_end_month: '',
                        admin_end_year: '',
                        familiarisation_start_day: '',
                        familiarisation_start_month: '',
                        familiarisation_start_year: '',
                        familiarisation_end_day: '',
                        familiarisation_end_month: '',
                        familiarisation_end_year: '',
                        live_start_day: '',
                        live_start_month: '',
                        live_start_year: '',
                        live_end_day: '',
                        live_end_month: '',
                        live_end_year: ''
  }
  add_edit_check_window_v2_page.enter_details(@check_window_hash)
  add_edit_check_window_v2_page.save_changes.click
end

When(/^I submit a valid change$/) do
  @check_window_hash[:check_name] = 'Updated' + @check_window_hash[:check_name]
  @check_window_hash[:admin_end_day] = @admin_end_date.day
  @check_window_hash[:admin_end_month] = @admin_end_date.month
  @check_window_hash[:admin_end_year] = @admin_end_date.year + 4
  add_edit_check_window_v2_page.enter_details(@check_window_hash)
  add_edit_check_window_v2_page.save_changes.click
end

Then(/^I should see it updated in the list of check windows$/) do
  @check_window = manage_check_window_page.find_check_row(@check_window_hash[:check_name])
  expect(@check_window.status.text).to eql 'Inactive'
  expect(@check_window).to have_remove
  expect(manage_check_window_page.flash_message.text).to eql @check_window_hash[:check_name] + ' has been edited'
end

When(/^I decide to cancel any changes$/) do
  @old_check_window_name = @check_window_hash[:check_name]
  @check_window_hash[:check_name] = 'Updated' + @check_window_hash[:check_name]
  add_edit_check_window_v2_page.cancel.click
end

Then(/^I should see no changes made in the list of windows$/) do
  @check_window = manage_check_window_page.find_check_row(@old_check_window_name)
  expect(@check_window.status.text).to eql 'Inactive'
  expect(@check_window).to have_remove
end

And(/^stored as it was in the db$/) do
  window_in_db = SqlDbHelper.check_window_details(@old_check_window_name)
  expect(window_in_db).to_not be_empty
end

