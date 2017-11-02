
And(/^I want to edit a previously added check$/) do
  step 'I am logged in with a test developer'
  step 'I am on the manage check windows page'
  manage_check_window_page.create_new_window.click
  @page = add_edit_check_window_page
  step 'I create new check window with valid data'
  check_window = manage_check_window_page.find_check_row(@check_window_name)
  check_window.check_name.click
end

And(/^I create new check window with valid data$/) do
  @today_date = Date.today
  @check_window_name = "TestCheck-#{@today_date.day}-#{@today_date.month}-#{@today_date.year}-#{rand(1..100)}"
  @check_window_hash = {check_name: @check_window_name,
                         admin_start_day: @today_date.next_month.day,
                        admin_start_mon: @today_date.month,
                        admin_start_year: @today_date.next_year.year,
                        check_start_day: @today_date.next_month.day,
                        check_start_mon: @today_date.next_month.month,
                        check_start_year: @today_date.next_year.year,
                        check_end_day: @today_date.next_day.day,
                        check_end_mon: @today_date.next_month.month,
                        check_end_year: @today_date.next_year.year
  }
  @page.enter_details(@check_window_hash)
  @page.save_changes.click
end

When(/^I update the check window with valid data$/) do
  @updated_check_window_hash = {check_name: @check_window_name,
                        admin_start_day: @today_date.next_month.day,
                        admin_start_mon: @today_date.next_month.month,
                        admin_start_year: @today_date.year,
                        check_start_day: @today_date.next_month.day,
                        check_start_mon: @today_date.next_month.month,
                        check_start_year: @today_date.year,
                        check_end_day: @today_date.day,
                        check_end_mon: @today_date.next_month.next_month.month,
                        check_end_year: @today_date.next_year.year
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
  wait_until{!(MongoDbHelper.check_window_details(@check_window_name.to_s)).nil?}
  @stored_pupil_details = MongoDbHelper.check_window_details @check_window_name.to_s
  expect(@updated_check_window_hash[:check_name]).to eql @stored_pupil_details['checkWindowName']
end