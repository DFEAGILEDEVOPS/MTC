Given(/^I have created a check window$/) do
  step "I am on the create a check window page"
  step "I submit details for a valid check window"
  step "I should see it added to the list of windows"
  step "stored correctly in the database"
end


Given(/^I am on the create a check window page$/) do
  step 'I am logged in with a service manager'
  admin_page.manage_check_windows.click
  manage_check_window_page.create_new_window.click
end

Then(/^create check window page should display all fields as per design$/) do
  expect(add_edit_check_window_page).to have_check_name

  expect(add_edit_check_window_page).to have_admin_start_day
  expect(add_edit_check_window_page).to have_admin_start_month
  expect(add_edit_check_window_page).to have_admin_start_year

  expect(add_edit_check_window_page).to have_check_start_day
  expect(add_edit_check_window_page).to have_check_start_month
  expect(add_edit_check_window_page).to have_check_start_year

  expect(add_edit_check_window_page).to have_check_end_day
  expect(add_edit_check_window_page).to have_check_end_month
  expect(add_edit_check_window_page).to have_check_end_year
end

When(/^I submit details for a valid check window$/) do
  today_date = Date.today
  @admin_start_date = today_date + 30
  @check_start_date = today_date + 33
  @check_end_date = today_date + 35
  check_window_name = "TestCheck-#{today_date.day}-#{today_date.month}-#{today_date.year}-#{rand(1..10000)}"
  @check_window_hash = {check_name: check_window_name,
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
  window_in_db = SqlDbHelper.check_window_details(@check_window_hash[:check_name])
  expect(window_in_db['checkStartDate'].strftime('%-d %-m %Y')).to eql @check_window_hash[:check_start_day].to_s + ' ' + @check_window_hash[:check_start_mon].to_s +
                                                                           ' ' + @check_window_hash[:check_start_year].to_s
  expect(window_in_db['checkEndDate'].strftime('%-d %-m %Y')).to eql @check_window_hash[:check_end_day].to_s + ' ' + @check_window_hash[:check_end_mon].to_s +
                                                                         ' ' + @check_window_hash[:check_end_year].to_s
  expect(window_in_db['adminStartDate'].strftime('%-d %-m %Y')).to eql @check_window_hash[:admin_start_day].to_s + ' ' + @check_window_hash[:admin_start_mon].to_s +
                                                                           ' ' + @check_window_hash[:admin_start_year].to_s
end

When(/^I enter details for a valid check window$/) do
  today_date = Date.today
  @admin_start_date = today_date + 30
  @check_start_date = today_date + 33
  @check_end_date = today_date + 35
  check_window_name = "TestCheck-#{today_date.day}-#{today_date.month}-#{today_date.year}-#{rand(1..10000)}"
  @check_window_hash = {check_name: check_window_name,
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
  @admin_start_date = today_date + 30
  @check_start_date = today_date + 33
  @check_end_date = today_date + 35
  @check_window_hash = {check_name: '',
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
  add_edit_check_window_page.enter_details(@check_window_hash)
  add_edit_check_window_page.save_changes.click
end

Then(/^I should see a error message for the name field$/) do
  expect(add_edit_check_window_page.error_summary).to be_all_there
  expect(add_edit_check_window_page.error_message.map {|error| error.text}).to eql ['Error in Name of check window']
end


When(/^I try to submit without a admin start date for the window$/) do
  today_date = Date.today
  @check_start_date = today_date + 33
  @check_end_date = today_date + 35
  check_window_name = "TestCheck-#{today_date.day}-#{today_date.month}-#{today_date.year}-#{rand(1..10000)}"
  @check_window_hash = {check_name: check_window_name,
                        admin_start_day: nil,
                        admin_start_mon: nil,
                        admin_start_year: nil,
                        check_start_day: @check_start_date.day,
                        check_start_mon: @check_start_date.month,
                        check_start_year: @check_start_date.year,
                        check_end_day: @check_end_date.day,
                        check_end_mon: @check_end_date.month,
                        check_end_year: @check_end_date.year
  }
  add_edit_check_window_page.enter_details(@check_window_hash)
  add_edit_check_window_page.save_changes.click
end

When(/^I try to submit with a invalid admin start date for the window$/) do
  today_date = Date.today
  @check_start_date = today_date + 33
  @check_end_date = today_date + 35
  check_window_name = "TestCheck-#{today_date.day}-#{today_date.month}-#{today_date.year}-#{rand(1..10000)}"
  @check_window_hash = {check_name: check_window_name,
                        admin_start_day: '32',
                        admin_start_mon: '13',
                        admin_start_year: '1000',
                        check_start_day: @check_start_date.day,
                        check_start_mon: @check_start_date.month,
                        check_start_year: @check_start_date.year,
                        check_end_day: @check_end_date.day,
                        check_end_mon: @check_end_date.month,
                        check_end_year: @check_end_date.year
  }
  add_edit_check_window_page.enter_details(@check_window_hash)
  add_edit_check_window_page.save_changes.click
end

Then(/^I should see errors for the admin start day month and year$/) do
  expect(add_edit_check_window_page.error_summary).to be_all_there
  expect(add_edit_check_window_page.error_message.map {|error| error.text}).to eql ['Please check "Date"',
                                                                                    'Please check "Day"',
                                                                                    'Please check "Month"',
                                                                                    'Please check "Year"']
end

When(/^I try to submit without a check start date for the window$/) do
  today_date = Date.today
  @admin_start_date = today_date + 30
  @check_end_date = today_date + 35
  check_window_name = "TestCheck-#{today_date.day}-#{today_date.month}-#{today_date.year}-#{rand(1..10000)}"
  @check_window_hash = {check_name: check_window_name,
                        admin_start_day: @admin_start_date.day,
                        admin_start_mon: @admin_start_date.month,
                        admin_start_year: @admin_start_date.year,
                        check_start_day: '',
                        check_start_mon: '',
                        check_start_year: '',
                        check_end_day: @check_end_date.day,
                        check_end_mon: @check_end_date.month,
                        check_end_year: @check_end_date.year
  }
  add_edit_check_window_page.enter_details(@check_window_hash)
  add_edit_check_window_page.save_changes.click
end

Then(/^I should see a error message for the check start date field$/) do
  expect(add_edit_check_window_page.error_summary).to be_all_there
  expect(add_edit_check_window_page.error_message.map {|error| error.text}).to eql ['"Check start day" is required',
                                                                                    '"Check start month" is required',
                                                                                    '"Check start year" is required']
end

When(/^I try to submit with a invalid check start date for the window$/) do
  today_date = Date.today
  @admin_start_date = today_date + 30
  @check_end_date = today_date + 35
  check_window_name = "TestCheck-#{today_date.day}-#{today_date.month}-#{today_date.year}-#{rand(1..10000)}"
  @check_window_hash = {check_name: check_window_name,
                        admin_start_day: @admin_start_date.day,
                        admin_start_mon: @admin_start_date.month,
                        admin_start_year: @admin_start_date.year,
                        check_start_day: '32',
                        check_start_mon: '13',
                        check_start_year: '20181',
                        check_end_day: @check_end_date.day,
                        check_end_mon: @check_end_date.month,
                        check_end_year: @check_end_date.year
  }
  add_edit_check_window_page.enter_details(@check_window_hash)
  add_edit_check_window_page.save_changes.click
end

Then(/^I should see errors for the start day month and year$/) do
  expect(add_edit_check_window_page.error_summary).to be_all_there
  expect(add_edit_check_window_page.error_message.map {|error| error.text}).to eql ["Please check \"Date\"",
                                                                                    'Please check "Day"',
                                                                                    'Please check "Month"',
                                                                                    'Please check "Year"']
end

When(/^I try to submit without a check end date for the window$/) do
  today_date = Date.today
  @admin_start_date = today_date + 30
  @check_start_date = today_date + 33
  check_window_name = "TestCheck-#{today_date.day}-#{today_date.month}-#{today_date.year}-#{rand(1..10000)}"
  @check_window_hash = {check_name: check_window_name,
                        admin_start_day: @admin_start_date.day,
                        admin_start_mon: @admin_start_date.month,
                        admin_start_year: @admin_start_date.year,
                        check_start_day: @check_start_date.day,
                        check_start_mon: @check_start_date.month,
                        check_start_year: @check_start_date.year,
                        check_end_day: '',
                        check_end_mon: '',
                        check_end_year: ''
  }
  add_edit_check_window_page.enter_details(@check_window_hash)
  add_edit_check_window_page.save_changes.click
end

Then(/^I should see a error message for the end date field$/) do
  expect(add_edit_check_window_page.error_summary).to be_all_there
  expect(add_edit_check_window_page.error_message.map {|error| error.text}).to eql ['"Check end day" is required',
                                                                                    '"Check end month" is required',
                                                                                    '"Check end year" is required']
end

When(/^I try to submit with a invalid check end date for the window$/) do
  today_date = Date.today
  @admin_start_date = today_date + 30
  @check_start_date = today_date + 33
  check_window_name = "TestCheck-#{today_date.day}-#{today_date.month}-#{today_date.year}-#{rand(1..1000000)}"
  @check_window_hash = {check_name: check_window_name,
                        admin_start_day: @admin_start_date.day,
                        admin_start_mon: @admin_start_date.month,
                        admin_start_year: @admin_start_date.year,
                        check_start_day: @check_start_date.day,
                        check_start_mon: @check_start_date.month,
                        check_start_year: @check_start_date.year,
                        check_end_day: '63',
                        check_end_mon: '49',
                        check_end_year: '100'
  }
  add_edit_check_window_page.enter_details(@check_window_hash)
  add_edit_check_window_page.save_changes.click
end

Then(/^I should see errors for the end day month and year$/) do
  expect(add_edit_check_window_page.error_summary).to be_all_there
  expect(add_edit_check_window_page.error_message.map {|error| error.text}).to eql ["Please check \"Date\"", "Please check \"Day\"", "Please check \"Month\"", "Please check \"Year\""]
end

Then(/^I should see an error stating the name cannot be less than (\d+) characters long$/) do |arg|
  expect(add_edit_check_window_page.error_summary).to be_all_there
  expect(add_edit_check_window_page.error_message.map {|error| error.text}).to eql ['"Name of check window" can\'t be less than 2 characters']
end

When(/^I try to submit a name that is less than (\d+) characters long$/) do |arg|
  today_date = Date.today
  @admin_start_date = today_date + 30
  @check_start_date = today_date + 33
  @check_end_date = today_date + 35
  @check_window_hash = {check_name: 'W',
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
  add_edit_check_window_page.enter_details(@check_window_hash)
  add_edit_check_window_page.save_changes.click
end

When(/^I try to submit a name that is (\d+) characters long$/) do |arg|
  today_date = Date.today
  @admin_start_date = today_date + 30
  @check_start_date = today_date + 33
  @check_end_date = today_date + 35
  @check_window_hash = {check_name: 'Win',
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
  add_edit_check_window_page.enter_details(@check_window_hash)
  add_edit_check_window_page.save_changes.click
end

Then(/^I should not see an error message for the check name$/) do
  expect(manage_check_window_page).to be_displayed
end

When(/^I try to submit admin start date that is in the past$/) do
  today_date = Date.today
  @admin_start_date = today_date - 1
  @check_start_date = today_date + 33
  @check_end_date = today_date + 35
  check_window_name = "TestCheck-#{today_date.day}-#{today_date.month}-#{today_date.year}-#{rand(1..10000)}"
  @check_window_hash = {check_name: check_window_name,
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
  add_edit_check_window_page.enter_details(@check_window_hash)
  add_edit_check_window_page.save_changes.click
end

Then(/^I should see an error stating the admin start date has to be in the future$/) do
  expect(add_edit_check_window_page.error_summary).to be_all_there
  expect(add_edit_check_window_page.error_message.map {|error| error.text}).to eql ['Start date must be in the future']
end

When(/^I try to submit a admin start date with more digits for day month year than specified$/) do
  today_date = Date.today
  @admin_start_date = today_date - 1
  @check_start_date = today_date + 33
  @check_end_date = today_date + 35
  check_window_name = "TestCheck-#{today_date.day}-#{today_date.month}-#{today_date.year}-#{rand(1..10000)}"
  @check_window_hash = {check_name: check_window_name,
                        admin_start_day: 101,
                        admin_start_mon: 101,
                        admin_start_year: 20178,
                        check_start_day: @check_start_date.day,
                        check_start_mon: @check_start_date.month,
                        check_start_year: @check_start_date.year,
                        check_end_day: @check_end_date.day,
                        check_end_mon: @check_end_date.month,
                        check_end_year: @check_end_date.year
  }
  add_edit_check_window_page.enter_details(@check_window_hash)
  add_edit_check_window_page.save_changes.click
end

Then(/^I should see errors for the admin start day month and year being invalid$/) do
  expect(add_edit_check_window_page.error_summary).to be_all_there
  expect(add_edit_check_window_page.error_message.map {|error| error.text}).to eql ["Please check \"Date\"",
                                                                                    "Please check \"Day\"",
                                                                                    "Please check \"Month\"",
                                                                                    "Please check \"Year\""]
end

When(/^I try to submit an admin start date that is after the check start date$/) do
  today_date = Date.today
  @admin_start_date = today_date + 34
  @check_start_date = today_date + 33
  @check_end_date = today_date + 35
  check_window_name = "TestCheck-#{today_date.day}-#{today_date.month}-#{today_date.year}-#{rand(1..10000)}"
  @check_window_hash = {check_name: check_window_name,
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
  add_edit_check_window_page.enter_details(@check_window_hash)
  add_edit_check_window_page.save_changes.click
end

Then(/^I should see an error stating the admin start date has to be before the check start date$/) do
  expect(add_edit_check_window_page.error_summary).to be_all_there
  expect(add_edit_check_window_page.error_message.map {|error| error.text}).to eql ['"Check start date" must occur after the "Administration start date"']
end

When(/^I try to submit a start date that is in the past$/) do
  today_date = Date.today
  @admin_start_date = today_date + 30
  @check_start_date = today_date - 1
  @check_end_date = today_date + 35
  check_window_name = "TestCheck-#{today_date.day}-#{today_date.month}-#{today_date.year}-#{rand(1..10000)}"
  @check_window_hash = {check_name: check_window_name,
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
  add_edit_check_window_page.enter_details(@check_window_hash)
  add_edit_check_window_page.save_changes.click
end

Then(/^I should see an error stating the start date must be in the future$/) do
  expect(add_edit_check_window_page.error_summary).to be_all_there
  expect(add_edit_check_window_page.error_message.map {|error| error.text}).to eql ['"Check start date" must occur after the "Administration start date"',
                                                                                    '"Check start date" must be in the future']
end

When(/^I try to submit a check start date with more digits for day month year than specified$/) do
  today_date = Date.today
  @admin_start_date = today_date + 30
  @check_end_date = today_date + 35
  check_window_name = "TestCheck-#{today_date.day}-#{today_date.month}-#{today_date.year}-#{rand(1..10000)}"
  @check_window_hash = {check_name: check_window_name,
                        admin_start_day: @admin_start_date.day,
                        admin_start_mon: @admin_start_date.month,
                        admin_start_year: @admin_start_date.year,
                        check_start_day: 101,
                        check_start_mon: 101,
                        check_start_year: 20172,
                        check_end_day: @check_end_date.day,
                        check_end_mon: @check_end_date.month,
                        check_end_year: @check_end_date.year
  }
  add_edit_check_window_page.enter_details(@check_window_hash)
  add_edit_check_window_page.save_changes.click
end

Then(/^I should see errors for the check start day month and year being invalid$/) do
  expect(add_edit_check_window_page.error_summary).to be_all_there
  expect(add_edit_check_window_page.error_message.map {|error| error.text}).to eql ['Please check "Date"',
                                                                                    "Please check \"Day\"",
                                                                                    "Please check \"Month\"",
                                                                                    "Please check \"Year\""]
end

When(/^I try to submit an check start date that is before the admin start date$/) do
  today_date = Date.today
  @admin_start_date = today_date + 33
  @check_start_date = today_date + 32
  @check_end_date = today_date + 35
  check_window_name = "TestCheck-#{today_date.day}-#{today_date.month}-#{today_date.year}-#{rand(1..10000)}"
  @check_window_hash = {check_name: check_window_name,
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
  add_edit_check_window_page.enter_details(@check_window_hash)
  add_edit_check_window_page.save_changes.click
end

When(/^I try to submit an check start date that is after the check end date$/) do
  today_date = Date.today
  @admin_start_date = today_date + 33
  @check_start_date = today_date + 36
  @check_end_date = today_date + 35
  check_window_name = "TestCheck-#{today_date.day}-#{today_date.month}-#{today_date.year}-#{rand(1..10000)}"
  @check_window_hash = {check_name: check_window_name,
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
  add_edit_check_window_page.enter_details(@check_window_hash)
  add_edit_check_window_page.save_changes.click
end

Then(/^I should see an error stating the check start date has to be before the check end date$/) do
  expect(add_edit_check_window_page.error_summary).to be_all_there
  expect(add_edit_check_window_page.error_message.map {|error| error.text}).to eql ['"Check end date" must occur after "Check start date"']
end

When(/^I try to submit check end date that is in the past$/) do
  today_date = Date.today
  @admin_start_date = today_date + 33
  @check_start_date = today_date + 36
  @check_end_date = today_date - 1
  check_window_name = "TestCheck-#{today_date.day}-#{today_date.month}-#{today_date.year}-#{rand(1..10000)}"
  @check_window_hash = {check_name: check_window_name,
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
  add_edit_check_window_page.enter_details(@check_window_hash)
  add_edit_check_window_page.save_changes.click
end

Then(/^I should see an error stating the check end date has to be in the future$/) do
  expect(add_edit_check_window_page.error_summary).to be_all_there
  expect(add_edit_check_window_page.error_message.map {|error| error.text}).to eql ['"Check end date" must occur after "Check start date"', '"Check end date" must be in the future']
end

Then(/^I should see an error stating the admin start date cant be blank$/) do
  expect(add_edit_check_window_page.error_summary).to be_all_there
  expect(add_edit_check_window_page.error_message.map {|error| error.text}).to eql ["\"Administration start day\" is required", "\"Administration start month\" is required", "\"Administration start year\" is required"]
end

When(/^I try to submit a check end date with more digits for day month year than specified$/) do
  today_date = Date.today
  @admin_start_date = today_date + 33
  @check_start_date = today_date + 36
  check_window_name = "TestCheck-#{today_date.day}-#{today_date.month}-#{today_date.year}-#{rand(1..10000)}"
  @check_window_hash = {check_name: check_window_name,
                        admin_start_day: @admin_start_date.day,
                        admin_start_mon: @admin_start_date.month,
                        admin_start_year: @admin_start_date.year,
                        check_start_day: @check_start_date.day,
                        check_start_mon: @check_start_date.month,
                        check_start_year: @check_start_date.year,
                        check_end_day: 101,
                        check_end_mon: 101,
                        check_end_year: 20178
  }
  add_edit_check_window_page.enter_details(@check_window_hash)
  add_edit_check_window_page.save_changes.click
end

Then(/^I should see errors for the check end day month and year being invalid$/) do
  expect(add_edit_check_window_page.error_summary).to be_all_there
  expect(add_edit_check_window_page.error_message.map {|error| error.text}).to eql ["Please check \"Date\"", "Please check \"Day\"", "Please check \"Month\"", "Please check \"Year\""]
end

When(/^I try to submit an check end date that is before the check start date$/) do
  today_date = Date.today
  @admin_start_date = today_date + 33
  @check_start_date = today_date + 36
  @check_end_date = today_date + 35
  check_window_name = "TestCheck-#{today_date.day}-#{today_date.month}-#{today_date.year}-#{rand(1..10000)}"
  @check_window_hash = {check_name: check_window_name,
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
  add_edit_check_window_page.enter_details(@check_window_hash)
  add_edit_check_window_page.save_changes.click
end

Then(/^I should see an error stating the check end date has to be after the check start date$/) do
  expect(add_edit_check_window_page.error_summary).to be_all_there
  expect(add_edit_check_window_page.error_message.map {|error| error.text}).to eql ["\"Check end date\" must occur after \"Check start date\""]
end

Then(/^I should see error message for the following admin start date$/) do |table|
  table.hashes.each do |hash|
    case hash['condition']
      when 'admin start date in past'
        step 'I try to submit admin start date that is in the past'
        step 'I should see an error stating the admin start date has to be in the future'
      when 'empty admin start date'
        step 'I try to submit without a admin start date for the window'
        step 'I should see an error stating the admin start date cant be blank'
      when 'invalid admin start date'
        step 'I try to submit with a invalid admin start date for the window'
        step 'I should see errors for the admin start day month and year'
      when 'more digit for day month and year'
        step 'I try to submit a admin start date with more digits for day month year than specified'
        step 'I should see errors for the admin start day month and year being invalid'
      when 'admin start date after check start date'
        step 'I try to submit an admin start date that is after the check start date'
        step 'I should see an error stating the admin start date has to be before the check start date'
      when 'update with empty admin start date'
        step 'I try to update without a admin start date for the window'
        step 'I should see an error stating the admin start date cant be blank'
    end
  end
end

Then(/^I should see error message for the following check start date$/) do |table|
  table.hashes.each do |hash|
    case hash['condition']
      when 'check start date in past'
        step 'I try to submit a start date that is in the past'
        step 'I should see an error stating the start date must be in the future'
      when 'empty check start date'
        step 'I try to submit without a check start date for the window'
        step 'I should see a error message for the check start date field'
      when 'invalid check start date'
        step 'I try to submit with a invalid check start date for the window'
        step 'I should see errors for the start day month and year'
      when 'more digit for day month and year'
        step 'I try to submit a check start date with more digits for day month year than specified'
        step 'I should see errors for the check start day month and year being invalid'
      when 'check start date after check end date'
        step 'I try to submit an check start date that is after the check end date'
        step 'I should see an error stating the check start date has to be before the check end date'
      when 'update with empty check start date'
        step 'I try to update without a check start date for the window'
        step 'I should see a error message for the check start date field'
    end
  end
end

Then(/^I should see error message for the following check end date$/) do |table|
  table.hashes.each do |hash|
    case hash['condition']
      when 'check end date in past'
        step 'I try to submit check end date that is in the past'
        step 'I should see an error stating the check end date has to be in the future'
      when 'empty check end date'
        step 'I try to submit without a check end date for the window'
        step 'I should see a error message for the end date field'
      when 'invalid check end date'
        step 'I try to submit with a invalid check end date for the window'
        step 'I should see errors for the end day month and year'
      when 'more digit for day month and year'
        step 'I try to submit a check end date with more digits for day month year than specified'
        step 'I should see errors for the check end day month and year being invalid'
      when 'update with empty check end date'
        step 'I try to update without a check end date for the window'
        step 'I should see a error message for the check start date field'
    end
  end
end