Given(/^I am on the create a check window page$/) do
  step 'I am logged in with a test developer'
  admin_page.manage_check_windows.click
  manage_check_window_page.create_new_window.click
end

Then(/^I should be able to name the window$/) do
  expect(add_edit_check_window_page).to have_check_name
end

Then(/^I should be able to enter a admin start date$/) do
  expect(add_edit_check_window_page).to have_admin_start_day
  expect(add_edit_check_window_page).to have_admin_start_month
  expect(add_edit_check_window_page).to have_admin_start_year
end

Then(/^I should be able to enter a check start date$/) do
  expect(add_edit_check_window_page).to have_check_start_day
  expect(add_edit_check_window_page).to have_check_start_month
  expect(add_edit_check_window_page).to have_check_start_year
end

Then(/^I should be able to enter a check end date$/) do
  expect(add_edit_check_window_page).to have_check_end_day
  expect(add_edit_check_window_page).to have_check_end_month
  expect(add_edit_check_window_page).to have_check_end_year
end

When(/^I submit details for a valid check window$/) do
  today_date = Date.today
  check_window_name = "TestCheck-#{today_date.day}-#{today_date.month}-#{today_date.year}-#{rand(1..100)}"
  @check_window_hash = {check_name: check_window_name,
                        admin_start_day: today_date.next_month.day,
                        admin_start_mon: today_date.next_month.month,
                        admin_start_year: today_date.year,
                        check_start_day: today_date.day,
                        check_start_mon: today_date.next_month.next_month.month,
                        check_start_year: today_date.next_year.year,
                        check_end_day: today_date.day,
                        check_end_mon: today_date.next_month.next_month.month,
                        check_end_year: today_date.next_year.year
  }
  add_edit_check_window_page.enter_details(@check_window_hash)
  add_edit_check_window_page.save_changes.click
end

Then(/^I should see it added to the list of windows$/) do
  expect(manage_check_window_page).to be_displayed
  window = manage_check_window_page.find_check_row(@check_window_hash[:check_name])
  formatted_admin_date = manage_check_window_page.format_admin_date(@check_window_hash[:admin_start_day].to_s,
                                                                    Date::MONTHNAMES[@check_window_hash[:admin_start_mon]].to_s,
                                                                    @check_window_hash[:admin_start_year].to_s)
  formatted_check_period = manage_check_window_page.format_check_period(@check_window_hash[:check_start_day].to_s,
                                                                        Date::MONTHNAMES[@check_window_hash[:check_start_mon]].to_s,
                                                                        @check_window_hash[:check_start_year].to_s,
                                                                        @check_window_hash[:check_end_day].to_s,
                                                                        Date::MONTHNAMES[@check_window_hash[:check_end_mon]].to_s,
                                                                        @check_window_hash[:check_end_year].to_s)
  expect(window.admin_start_date.text).to eql formatted_admin_date
  expect(window.check_period.text).to eql formatted_check_period
  expect(window).to have_remove
end

And(/^stored correctly in the database$/) do
  window_in_db = MongoDbHelper.check_window_details(@check_window_hash[:check_name])
  expect(window_in_db['checkStartDate'].strftime('%-d %-m %Y')).to eql @check_window_hash[:check_start_day].to_s + ' ' + @check_window_hash[:check_start_mon].to_s +
                                                       ' ' + @check_window_hash[:check_start_year].to_s
  expect(window_in_db['checkEndDate'].strftime('%-d %-m %Y')).to eql @check_window_hash[:check_end_day].to_s + ' ' + @check_window_hash[:check_end_mon].to_s +
                                                                         ' ' + @check_window_hash[:check_end_year].to_s
  expect(window_in_db['adminStartDate'].strftime('%-d %-m %Y')).to eql @check_window_hash[:admin_start_day].to_s + ' ' + @check_window_hash[:admin_start_mon].to_s +
                                                       ' ' + @check_window_hash[:admin_start_year].to_s
end

When(/^I enter details for a valid check window$/) do
  today_date = Date.today
  check_window_name = "TestCheck-#{today_date.day}-#{today_date.month}-#{today_date.year}-#{rand(1..100)}"
  @check_window_hash = {check_name: check_window_name,
                        admin_start_day: (today_date + 30).day,
                        admin_start_mon: today_date.next_month.month,
                        admin_start_year: today_date.year,
                        check_start_day: today_date.day,
                        check_start_mon: today_date.next_month.next_month.month,
                        check_start_year: today_date.year,
                        check_end_day: today_date.day,
                        check_end_mon: today_date.next_month.next_month.month,
                        check_end_year: today_date.year
  }
  add_edit_check_window_page.enter_details(@check_window_hash)
end

But(/^decide against creating it$/) do
  add_edit_check_window_page.back.click
end

Then(/^I should not see it in the list of windows$/) do
  expect(manage_check_window_page.windows_table.rows.find {|chk| chk.text.include? @check_window_hash[:check_name]}).to be_nil
end

When(/^I try to submit without a name for the window$/) do
  today_date = Date.today
  @check_window_hash = {check_name: '',
                        admin_start_day: (today_date + 30).day,
                        admin_start_mon: today_date.next_month.month,
                        admin_start_year: today_date.year,
                        check_start_day: today_date.day,
                        check_start_mon: today_date.next_month.next_month.month,
                        check_start_year: today_date.year,
                        check_end_day: today_date.day,
                        check_end_mon: today_date.next_month.next_month.month,
                        check_end_year: today_date.year
  }
  add_edit_check_window_page.enter_details(@check_window_hash)
  add_edit_check_window_page.save_changes.click
end

Then(/^I should see a error message for the name field$/) do
  expect(add_edit_check_window_page.error_message.map {|error| error.text}).to eql ['Error in Name of check window']
end


When(/^I try to submit without a admin start date for the window$/) do
  today_date = Date.today
  check_window_name = "TestCheck-#{today_date.day}-#{today_date.month}-#{today_date.year}-#{rand(1..100)}"
  @check_window_hash = {check_name: check_window_name,
                        admin_start_day: '',
                        admin_start_mon: '',
                        admin_start_year: '',
                        check_start_day: today_date.day,
                        check_start_mon: today_date.next_month.next_month.month,
                        check_start_year: today_date.year,
                        check_end_day: today_date.day,
                        check_end_mon: today_date.next_month.next_month.month,
                        check_end_year: today_date.year
  }
  add_edit_check_window_page.enter_details(@check_window_hash)
  add_edit_check_window_page.save_changes.click
end

Then(/^I should see a error message for the admin start date field$/) do
  expect(add_edit_check_window_page.error_message.map {|error| error.text}).to eql ["Admin start day is required",
                                                                                    "Admin start month is required",
                                                                                    "Admin start year is required"]
end

When(/^I try to submit with a invalid admin start date for the window$/) do
  today_date = Date.today
  check_window_name = "TestCheck-#{today_date.day}-#{today_date.month}-#{today_date.year}-#{rand(1..100)}"
  @check_window_hash = {check_name: check_window_name,
                        admin_start_day: '32',
                        admin_start_mon: '13',
                        admin_start_year: '1000',
                        check_start_day: today_date.day,
                        check_start_mon: today_date.next_month.month,
                        check_start_year: today_date.year,
                        check_end_day: today_date.day,
                        check_end_mon: today_date.next_month.month,
                        check_end_year: today_date.year
  }
  add_edit_check_window_page.enter_details(@check_window_hash)
  add_edit_check_window_page.save_changes.click
end

Then(/^I should see errors for the admin start day month and year$/) do
  expect(add_edit_check_window_page.error_message.map {|error| error.text}).to eql ['Please check "Day"',
                                                                                    'Please check "Month"',
                                                                                    'Please check "Year"']
end

When(/^I try to submit without a check start date for the window$/) do
  today_date = Date.today
  check_window_name = "TestCheck-#{today_date.day}-#{today_date.month}-#{today_date.year}-#{rand(1..100)}"
  @check_window_hash = {check_name: check_window_name,
                        admin_start_day: today_date.day,
                        admin_start_mon: today_date.next_month.month,
                        admin_start_year: today_date.year,
                        check_start_day: '',
                        check_start_mon: '',
                        check_start_year: '',
                        check_end_day: today_date.day,
                        check_end_mon: today_date.next_month.next_month.month,
                        check_end_year: today_date.next_year.year
  }
  add_edit_check_window_page.enter_details(@check_window_hash)
  add_edit_check_window_page.save_changes.click
end

Then(/^I should see a error message for the check start date field$/) do
  expect(add_edit_check_window_page.error_message.map {|error| error.text}).to eql ['"Administration start date" must be before the "Check start date"',
                                                                                    "Check start day is required",
                                                                                    "Check start month is required",
                                                                                    "Check start year is required"]
end

When(/^I try to submit with a invalid check start date for the window$/) do
  today_date = Date.today
  check_window_name = "TestCheck-#{today_date.day}-#{today_date.month}-#{today_date.year}-#{rand(1..100)}"
  @check_window_hash = {check_name: check_window_name,
                        admin_start_day: today_date.day,
                        admin_start_mon: today_date.next_month.month,
                        admin_start_year: today_date.year,
                        check_start_day: '32',
                        check_start_mon: '13',
                        check_start_year: '010',
                        check_end_day: today_date.day,
                        check_end_mon: today_date.next_month.next_month.month,
                        check_end_year: today_date.next_year.year
  }
  add_edit_check_window_page.enter_details(@check_window_hash)
  add_edit_check_window_page.save_changes.click
end

Then(/^I should see errors for the start day month and year$/) do
  expect(add_edit_check_window_page.error_message.map {|error| error.text}).to eql ['Please check "Day"',
                                                                                    'Please check "Month"',
                                                                                    'Please check "Year"']
end

When(/^I try to submit without a check end date for the window$/) do
  today_date = Date.today
  check_window_name = "TestCheck-#{today_date.day}-#{today_date.month}-#{today_date.year}-#{rand(1..100)}"
  @check_window_hash = {check_name: check_window_name,
                        admin_start_day: today_date.day,
                        admin_start_mon: today_date.next_month.month,
                        admin_start_year: today_date.year,
                        check_start_day: today_date.day,
                        check_start_mon: today_date.next_month.next_month.month,
                        check_start_year: today_date.next_year.year,
                        check_end_day: '',
                        check_end_mon: '',
                        check_end_year: ''
  }
  add_edit_check_window_page.enter_details(@check_window_hash)
  add_edit_check_window_page.save_changes.click
end

Then(/^I should see a error message for the end date field$/) do
  expect(add_edit_check_window_page.error_message.map {|error| error.text}).to eql ["Check end day is required",
                                                                                    "Check end month is required",
                                                                                    "Check end year is required"]
end

When(/^I try to submit with a invalid check end date for the window$/) do
  today_date = Date.today
  check_window_name = "TestCheck-#{today_date.day}-#{today_date.month}-#{today_date.year}-#{rand(1..100)}"
  @check_window_hash = {check_name: check_window_name,
                        admin_start_day: today_date.day,
                        admin_start_mon: today_date.next_month.month,
                        admin_start_year: today_date.year,
                        check_start_day: today_date.day,
                        check_start_mon: today_date.next_month.next_month.month,
                        check_start_year: today_date.next_year.year,
                        check_end_day: '63',
                        check_end_mon: '49',
                        check_end_year: '100'
  }
  add_edit_check_window_page.enter_details(@check_window_hash)
  add_edit_check_window_page.save_changes.click
end

Then(/^I should see errors for the end day month and year$/) do
  expect(add_edit_check_window_page.error_message.map {|error| error.text}).to eql ['Please check "Day"',
                                                                                    'Please check "Month"',
                                                                                    'Please check "Year"']
end