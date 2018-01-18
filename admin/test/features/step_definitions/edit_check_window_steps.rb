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
                        admin_start_year: @admin_start_date.next_year.year,
                        check_start_day: @check_start_date.next_month.day,
                        check_start_mon: @check_start_date.next_month.month,
                        check_start_year: @check_start_date.next_year.year,
                        check_end_day: @check_end_date.next_day.day,
                        check_end_mon: @check_end_date.next_month.month,
                        check_end_year: @check_end_date.next_year.year
  }
  @page.enter_details(@check_window_hash)
  @page.save_changes.click
end

When(/^I update the check window with valid data$/) do
  @admin_start_date = @admin_start_date + 30
  @check_start_date = @check_start_date + 33
  @check_end_date = @check_end_date + 35
  @updated_check_window_hash = {check_name: @check_window_name,
                                admin_start_day: @admin_start_date.day,
                                admin_start_mon: @admin_start_date.month,
                                admin_start_year: @admin_start_date.year,
                                check_start_day: @check_start_date.day,
                                check_start_mon: @check_start_date.month,
                                check_start_year: @check_start_date.year,
                                check_end_day: @check_end_date.day,
                                check_end_mon: @check_end_date.next_month.next_month.month,
                                check_end_year: @check_end_date.next_year.year
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