Given(/^I navigate to the create check window page$/) do
  step 'I am logged in with a service manager'
  add_edit_check_window_v2_page.load
end

When(/^I fill in details of a valid check window$/) do
  today_date = Date.today
  @admin_start_date = today_date.next_year(5) + 2
  @admin_end_date = today_date.next_year(5) + 11
  @familiarisation_start_date = today_date.next_year(5) + 3
  @familiarisation_end_date = today_date.next_year(5) + 10
  @live_start_date = today_date.next_year(5) + 4
  @live_end_date = today_date.next_year(5) + 10
  check_window_name = "TestCheck-#{today_date.day}-#{today_date.month}-#{today_date.year}-#{rand(1..10000)}"
  @check_window_hash = {check_name: check_window_name,
                        admin_start_day: @admin_start_date.day,
                        admin_start_month: @admin_start_date.month,
                        admin_start_year: @admin_start_date.year,
                        admin_end_day: @admin_end_date.day,
                        admin_end_month: @admin_end_date.month,
                        admin_end_year: @admin_end_date.year,
                        familiarisation_start_day: @familiarisation_start_date.day,
                        familiarisation_start_month: @familiarisation_start_date.month,
                        familiarisation_start_year: @familiarisation_start_date.year,
                        familiarisation_end_day: @familiarisation_end_date.day,
                        familiarisation_end_month: @familiarisation_end_date.month,
                        familiarisation_end_year: @familiarisation_end_date.year,
                        live_start_day: @live_start_date.day,
                        live_start_month: @live_start_date.month,
                        live_start_year: @live_start_date.year,
                        live_end_day: @live_end_date.day,
                        live_end_month: @live_end_date.month,
                        live_end_year: @live_end_date.year
  }
  add_edit_check_window_v2_page.enter_details(@check_window_hash)
  p check_window_name
end

But(/^decide I against creating it$/) do
  add_edit_check_window_v2_page.cancel.click
end

Then(/^I should not see the window in the list$/) do
  expect(manage_check_window_page.windows_table.rows.find {|chk| chk.text.include? @check_window_hash[:check_name]}).to be_nil
end

When(/^I try to submit a check name that is less than (\d+) character long$/) do |arg|
  today_date = Date.today
  @admin_start_date = today_date.next_year(5) + 3
  @admin_end_date = today_date.next_year(5) + 11
  @familiarisation_start_date = today_date.next_year(5) + 4
  @familiarisation_end_date = today_date.next_year(5) + 10
  @live_start_date = today_date.next_year(5) + 4
  @live_end_date = today_date.next_year(5) + 10
  check_window_name = "W" * (arg - 1)
  @check_window_hash = {check_name: check_window_name,
                        admin_start_day: @admin_start_date.day,
                        admin_start_month: @admin_start_date.month,
                        admin_start_year: @admin_start_date.year,
                        admin_end_day: @admin_end_date.day,
                        admin_end_month: @admin_end_date.month,
                        admin_end_year: @admin_end_date.year,
                        familiarisation_start_day: @familiarisation_start_date.day,
                        familiarisation_start_month: @familiarisation_start_date.month,
                        familiarisation_start_year: @familiarisation_start_date.year,
                        familiarisation_end_day: @familiarisation_end_date.day,
                        familiarisation_end_month: @familiarisation_end_date.month,
                        familiarisation_end_year: @familiarisation_end_date.year,
                        live_start_day: @live_start_date.day,
                        live_start_month: @live_start_date.month,
                        live_start_year: @live_start_date.year,
                        live_end_day: @live_end_date.day,
                        live_end_month: @live_end_date.month,
                        live_end_year: @live_end_date.year
  }
  add_edit_check_window_v2_page.enter_details(@check_window_hash)
  add_edit_check_window_v2_page.save_changes.click
end

Then(/^I should see an error stating the check name cannot be less than (\d+) character long$/) do |arg|
  expect(add_edit_check_window_v2_page.error_summary.error_messages.first.text).to eql 'Enter a name between 1 and 35 characters'
end

When(/^I enter dates that are in the past$/) do
  today_date = Date.today
  @admin_start_date = today_date - 2
  @admin_end_date = today_date - 1
  @familiarisation_start_date = today_date - 2
  @familiarisation_end_date = today_date - 1
  @live_start_date = today_date - 2
  @live_end_date = today_date - 1
  check_window_name = "TestCheck-#{today_date.day}-#{today_date.month}-#{today_date.year}-#{rand(1..10000)}"
  @check_window_hash = {check_name: check_window_name,
                        admin_start_day: @admin_start_date.day,
                        admin_start_month: @admin_start_date.month,
                        admin_start_year: @admin_start_date.year,
                        admin_end_day: @admin_end_date.day,
                        admin_end_month: @admin_end_date.month,
                        admin_end_year: @admin_end_date.year,
                        familiarisation_start_day: @familiarisation_start_date.day,
                        familiarisation_start_month: @familiarisation_start_date.month,
                        familiarisation_start_year: @familiarisation_start_date.year,
                        familiarisation_end_day: @familiarisation_end_date.day,
                        familiarisation_end_month: @familiarisation_end_date.month,
                        familiarisation_end_year: @familiarisation_end_date.year,
                        live_start_day: @live_start_date.day,
                        live_start_month: @live_start_date.month,
                        live_start_year: @live_start_date.year,
                        live_end_day: @live_end_date.day,
                        live_end_month: @live_end_date.month,
                        live_end_year: @live_end_date.year
  }
  add_edit_check_window_v2_page.enter_details(@check_window_hash)
  add_edit_check_window_v2_page.save_changes.click
end

Then(/^I should see error messages stating the dates must be in the future$/) do
  expect(add_edit_check_window_v2_page).to have_error_summary
  expect(add_edit_check_window_v2_page).to have_warning_summary
  expect(add_edit_check_window_v2_page.error_messages.map {|error| error.text}).to eql ["Enter a school administration start date in the future",
                                                                                        "Enter a school administration end date in the future",
                                                                                        "Enter a try it out start date in the future",
                                                                                        "Enter a try it out end date in the future",
                                                                                        "Enter a multiplication tables check start date in the future",
                                                                                        "Enter a multiplication tables check end date in the future"]
end


When(/^I enter end dates that are on the same day as the start date$/) do
  today_date = Date.today
  @admin_start_date = today_date.next_year(5) + 3
  @admin_end_date = today_date.next_year(5) + 3
  @familiarisation_start_date = today_date.next_year(5) + 3
  @familiarisation_end_date = today_date.next_year(5) + 3
  @live_start_date = today_date.next_year(5) + 3
  @live_end_date = today_date.next_year(5) +3
  check_window_name = "TestCheck-#{today_date.day}-#{today_date.month}-#{today_date.year}-#{rand(1..10000)}"
  @check_window_hash = {check_name: check_window_name,
                        admin_start_day: @admin_start_date.day,
                        admin_start_month: @admin_start_date.month,
                        admin_start_year: @admin_start_date.year,
                        admin_end_day: @admin_end_date.day,
                        admin_end_month: @admin_end_date.month,
                        admin_end_year: @admin_end_date.year,
                        familiarisation_start_day: @familiarisation_start_date.day,
                        familiarisation_start_month: @familiarisation_start_date.month,
                        familiarisation_start_year: @familiarisation_start_date.year,
                        familiarisation_end_day: @familiarisation_end_date.day,
                        familiarisation_end_month: @familiarisation_end_date.month,
                        familiarisation_end_year: @familiarisation_end_date.year,
                        live_start_day: @live_start_date.day,
                        live_start_month: @live_start_date.month,
                        live_start_year: @live_start_date.year,
                        live_end_day: @live_end_date.day,
                        live_end_month: @live_end_date.month,
                        live_end_year: @live_end_date.year
  }
  add_edit_check_window_v2_page.enter_details(@check_window_hash)
  add_edit_check_window_v2_page.save_changes.click
end

When(/^I enter dates that are inside of active check window$/) do
  today_date = Date.today
  @admin_start_date = today_date + 3
  @admin_end_date = today_date + 3
  @familiarisation_start_date = today_date + 3
  @familiarisation_end_date = today_date + 3
  @live_start_date = today_date + 3
  @live_end_date = today_date +3
  check_window_name = "TestCheck-#{today_date.day}-#{today_date.month}-#{today_date.year}-#{rand(1..10000)}"
  @check_window_hash = {check_name: check_window_name,
                        admin_start_day: @admin_start_date.day,
                        admin_start_month: @admin_start_date.month,
                        admin_start_year: @admin_start_date.year,
                        admin_end_day: @admin_end_date.day,
                        admin_end_month: @admin_end_date.month,
                        admin_end_year: @admin_end_date.year,
                        familiarisation_start_day: @familiarisation_start_date.day,
                        familiarisation_start_month: @familiarisation_start_date.month,
                        familiarisation_start_year: @familiarisation_start_date.year,
                        familiarisation_end_day: @familiarisation_end_date.day,
                        familiarisation_end_month: @familiarisation_end_date.month,
                        familiarisation_end_year: @familiarisation_end_date.year,
                        live_start_day: @live_start_date.day,
                        live_start_month: @live_start_date.month,
                        live_start_year: @live_start_date.year,
                        live_end_day: @live_end_date.day,
                        live_end_month: @live_end_date.month,
                        live_end_year: @live_end_date.year
  }
  add_edit_check_window_v2_page.enter_details(@check_window_hash)
  add_edit_check_window_v2_page.save_changes.click
end

Then(/^I should errors for dates inside active check window date$/) do
  array_of_errors = ["Enter dates outside of the active check window administration period",
                     "Enter dates outside of the active check window try out period",
                     "Enter dates outside of the active check window live period"]
  expect(add_edit_check_window_v2_page).to have_error_summary
  expect(add_edit_check_window_v2_page.error_summary).to have_error_text
  expect(add_edit_check_window_v2_page.error_summary.error_messages.map {|error| error.text}).to eql array_of_errors
  expect(add_edit_check_window_v2_page.error_messages.map {|error| error.text}).to eql array_of_errors
end

Then(/^I should see error messages stating the end dates must be at least one day after the start dates$/) do
  expect(add_edit_check_window_v2_page).to have_error_summary
  expect(add_edit_check_window_v2_page.error_summary).to have_error_text
  expect(add_edit_check_window_v2_page.error_messages.map {|error| error.text}).to eql ["Enter a school administration start date which is before the administration end date",
                                                                                        "Enter a school administration end date which is after the administration start date",
                                                                                        "Enter a school administration end date which is after the multiplication tables check end date",
                                                                                        "Enter a school administration end date which is after the try it out end date",
                                                                                        "Enter a try it out start date which is before the multiplication tables check start date",
                                                                                        "Enter a try it out start date which is before the try it out end date",
                                                                                        "Enter a try it out end date which is before the administration end date",
                                                                                        "Enter a try it out end date which is after the try it out start date",
                                                                                        "Enter a multiplication tables check start date which is before the multiplication tables check end date",
                                                                                        "Enter a multiplication tables check end date which is before the administration end date",
                                                                                        "Enter a multiplication tables check start date which is after the try it out start date",
                                                                                        "Enter a multiplication tables check end date which is after the multiplication tables check start date"]
end

When(/^I enter a admin end date that is before the end dates for familiarisation and live check$/) do
  today_date = Date.today
  @admin_start_date = today_date.next_year(5) + 3
  @admin_end_date = today_date.next_year(5) + 3
  @familiarisation_start_date = today_date.next_year(5) + 5
  @familiarisation_end_date = today_date.next_year(5) + 5
  @live_start_date = today_date.next_year(5) + 5
  @live_end_date = today_date.next_year(5) +5
  check_window_name = "TestCheck-#{today_date.day}-#{today_date.month}-#{today_date.year}-#{rand(1..10000)}"
  @check_window_hash = {check_name: check_window_name,
                        admin_start_day: @admin_start_date.day,
                        admin_start_month: @admin_start_date.month,
                        admin_start_year: @admin_start_date.year,
                        admin_end_day: @admin_end_date.day,
                        admin_end_month: @admin_end_date.month,
                        admin_end_year: @admin_end_date.year,
                        familiarisation_start_day: @familiarisation_start_date.day,
                        familiarisation_start_month: @familiarisation_start_date.month,
                        familiarisation_start_year: @familiarisation_start_date.year,
                        familiarisation_end_day: @familiarisation_end_date.day,
                        familiarisation_end_month: @familiarisation_end_date.month,
                        familiarisation_end_year: @familiarisation_end_date.year,
                        live_start_day: @live_start_date.day,
                        live_start_month: @live_start_date.month,
                        live_start_year: @live_start_date.year,
                        live_end_day: @live_end_date.day,
                        live_end_month: @live_end_date.month,
                        live_end_year: @live_end_date.year
  }
  add_edit_check_window_v2_page.enter_details(@check_window_hash)
  add_edit_check_window_v2_page.save_changes.click
end

Then(/^I should see an error stating the admin end date must be after the end dates for familiarisation and live check$/) do
  expect(add_edit_check_window_v2_page).to have_error_summary
  expect(add_edit_check_window_v2_page.error_summary).to have_error_text
  expect(add_edit_check_window_v2_page.error_messages.map {|error| error.text}).to eql [

                                                                                        "Enter a school administration end date which is after the multiplication tables check end date",
                                                                                        "Enter a school administration end date which is after the try it out end date",
                                                                                        "Enter a try it out end date which is the same date or before the administration end date",
                                                                                        "Enter a multiplication tables check end date which is the same date or before the administration end date"]
end

When(/^I enter a familiarisation start date that is in the past compared to the admin start date$/) do
  today_date = Date.today
  @admin_start_date = today_date.next_year(5) + 3
  @admin_end_date = today_date.next_year(5) + 11
  @familiarisation_start_date = today_date.next_year(5) + 2
  @familiarisation_end_date = today_date.next_year(5) + 10
  @live_start_date = today_date.next_year(5) + 4
  @live_end_date = today_date.next_year(5) + 10
  check_window_name = "TestCheck-#{today_date.day}-#{today_date.month}-#{today_date.year}-#{rand(1..10000)}"
  @check_window_hash = {check_name: check_window_name,
                        admin_start_day: @admin_start_date.day,
                        admin_start_month: @admin_start_date.month,
                        admin_start_year: @admin_start_date.year,
                        admin_end_day: @admin_end_date.day,
                        admin_end_month: @admin_end_date.month,
                        admin_end_year: @admin_end_date.year,
                        familiarisation_start_day: @familiarisation_start_date.day,
                        familiarisation_start_month: @familiarisation_start_date.month,
                        familiarisation_start_year: @familiarisation_start_date.year,
                        familiarisation_end_day: @familiarisation_end_date.day,
                        familiarisation_end_month: @familiarisation_end_date.month,
                        familiarisation_end_year: @familiarisation_end_date.year,
                        live_start_day: @live_start_date.day,
                        live_start_month: @live_start_date.month,
                        live_start_year: @live_start_date.year,
                        live_end_day: @live_end_date.day,
                        live_end_month: @live_end_date.month,
                        live_end_year: @live_end_date.year
  }
  add_edit_check_window_v2_page.enter_details(@check_window_hash)
  add_edit_check_window_v2_page.save_changes.click
end

Then(/^I should see an error stating Start date for familiarisation must be on the same day or in the future as the admin start date$/) do
  expect(add_edit_check_window_v2_page).to have_error_summary
  expect(add_edit_check_window_v2_page.error_summary).to have_error_text
  expect(add_edit_check_window_v2_page.error_messages.map {|error| error.text}).to eql ["Enter a school administration start date which is before or on the same day as the try it out start date",
                                                                                        "Enter a try it out start date which is the same date or after the administration start date"]
end

When(/^I enter a familiarisation start date that is a day after the live check start date$/) do
  today_date = Date.today
  @admin_start_date = today_date.next_year(5) + 3
  @admin_end_date = today_date.next_year(5) + 11
  @familiarisation_start_date = today_date.next_year(5) + 5
  @familiarisation_end_date = today_date.next_year(5) + 10
  @live_start_date = today_date.next_year(5) + 4
  @live_end_date = today_date.next_year(5) + 10
  check_window_name = "TestCheck-#{today_date.day}-#{today_date.month}-#{today_date.year}-#{rand(1..10000)}"
  @check_window_hash = {check_name: check_window_name,
                        admin_start_day: @admin_start_date.day,
                        admin_start_month: @admin_start_date.month,
                        admin_start_year: @admin_start_date.year,
                        admin_end_day: @admin_end_date.day,
                        admin_end_month: @admin_end_date.month,
                        admin_end_year: @admin_end_date.year,
                        familiarisation_start_day: @familiarisation_start_date.day,
                        familiarisation_start_month: @familiarisation_start_date.month,
                        familiarisation_start_year: @familiarisation_start_date.year,
                        familiarisation_end_day: @familiarisation_end_date.day,
                        familiarisation_end_month: @familiarisation_end_date.month,
                        familiarisation_end_year: @familiarisation_end_date.year,
                        live_start_day: @live_start_date.day,
                        live_start_month: @live_start_date.month,
                        live_start_year: @live_start_date.year,
                        live_end_day: @live_end_date.day,
                        live_end_month: @live_end_date.month,
                        live_end_year: @live_end_date.year
  }
  add_edit_check_window_v2_page.enter_details(@check_window_hash)
  add_edit_check_window_v2_page.save_changes.click
end

Then(/^I should see an error stating familiarisation start date must be at least a day before the live check start date$/) do
  expect(add_edit_check_window_v2_page).to have_error_summary
  expect(add_edit_check_window_v2_page.error_summary).to have_error_text
  expect(add_edit_check_window_v2_page.error_messages.map {|error| error.text}).to eql ["Enter a try it out start date which is the same date or before the multiplication tables check start date",
                                                                                        "Enter a multiplication tables check start date which is the same date or after the try it out start date"]
end

When(/^I enter a familiarisation end date that is a day before the familiarisation start date$/) do
  today_date = Date.today
  @admin_start_date = today_date.next_year(5) + 3
  @admin_end_date = today_date.next_year(5) + 11
  @familiarisation_start_date = today_date.next_year(5) + 8
  @familiarisation_end_date = today_date.next_year(5) + 7
  @live_start_date = today_date.next_year(5) + 8
  @live_end_date = today_date.next_year(5) + 7
  check_window_name = "TestCheck-#{today_date.day}-#{today_date.month}-#{today_date.year}-#{rand(1..10000)}"
  @check_window_hash = {check_name: check_window_name,
                        admin_start_day: @admin_start_date.day,
                        admin_start_month: @admin_start_date.month,
                        admin_start_year: @admin_start_date.year,
                        admin_end_day: @admin_end_date.day,
                        admin_end_month: @admin_end_date.month,
                        admin_end_year: @admin_end_date.year,
                        familiarisation_start_day: @familiarisation_start_date.day,
                        familiarisation_start_month: @familiarisation_start_date.month,
                        familiarisation_start_year: @familiarisation_start_date.year,
                        familiarisation_end_day: @familiarisation_end_date.day,
                        familiarisation_end_month: @familiarisation_end_date.month,
                        familiarisation_end_year: @familiarisation_end_date.year,
                        live_start_day: @live_start_date.day,
                        live_start_month: @live_start_date.month,
                        live_start_year: @live_start_date.year,
                        live_end_day: @live_end_date.day,
                        live_end_month: @live_end_date.month,
                        live_end_year: @live_end_date.year
  }
  add_edit_check_window_v2_page.enter_details(@check_window_hash)
  add_edit_check_window_v2_page.save_changes.click
end

Then(/^I should see an error stating familiarisation end date must be at least a day after the start date$/) do
  expect(add_edit_check_window_v2_page).to have_error_summary
  expect(add_edit_check_window_v2_page.error_summary).to have_error_text
  expect(add_edit_check_window_v2_page.error_messages.map {|error| error.text}).to eql ["Enter a try it out start date which is before the try it out end date",
                                                                                        "Enter a try it out end date which is after the try it out start date",
                                                                                        "Enter a multiplication tables check start date which is before the multiplication tables check end date",
                                                                                        "Enter a multiplication tables check end date which is after the multiplication tables check start date"]
end

When(/^I enter a live start date that is a day before the familiarisation start date$/) do
  today_date = Date.today
  @admin_start_date = today_date.next_year(5) + 3
  @admin_end_date = today_date.next_year(5) + 11
  @familiarisation_start_date = today_date.next_year(5) + 5
  @familiarisation_end_date = today_date.next_year(5) + 7
  @live_start_date = today_date.next_year(5) + 4
  @live_end_date = today_date.next_year(5) + 7
  check_window_name = "TestCheck-#{today_date.day}-#{today_date.month}-#{today_date.year}-#{rand(1..10000)}"
  @check_window_hash = {check_name: check_window_name,
                        admin_start_day: @admin_start_date.day,
                        admin_start_month: @admin_start_date.month,
                        admin_start_year: @admin_start_date.year,
                        admin_end_day: @admin_end_date.day,
                        admin_end_month: @admin_end_date.month,
                        admin_end_year: @admin_end_date.year,
                        familiarisation_start_day: @familiarisation_start_date.day,
                        familiarisation_start_month: @familiarisation_start_date.month,
                        familiarisation_start_year: @familiarisation_start_date.year,
                        familiarisation_end_day: @familiarisation_end_date.day,
                        familiarisation_end_month: @familiarisation_end_date.month,
                        familiarisation_end_year: @familiarisation_end_date.year,
                        live_start_day: @live_start_date.day,
                        live_start_month: @live_start_date.month,
                        live_start_year: @live_start_date.year,
                        live_end_day: @live_end_date.day,
                        live_end_month: @live_end_date.month,
                        live_end_year: @live_end_date.year
  }
  add_edit_check_window_v2_page.enter_details(@check_window_hash)
  add_edit_check_window_v2_page.save_changes.click
end

Then(/^I should see an error stating live start date must be at least a day after the familiarisation check start date$/) do
  expect(add_edit_check_window_v2_page).to have_error_summary
  expect(add_edit_check_window_v2_page.error_summary).to have_error_text
  expect(add_edit_check_window_v2_page.error_messages.map {|error| error.text}).to eql ["Enter a try it out start date which is the same date or before the multiplication tables check start date",
                                                                                        "Enter a multiplication tables check start date which is the same date or after the try it out start date"]
end

When(/^I try submit with no dates$/) do
  add_edit_check_window_v2_page.save_changes.click
end

Then(/^I should errors stating that entries are required$/) do
  array_of_errors = ["Enter a name between 1 and 35 characters",
                     "Enter a valid day for school administration start date",
                     "Enter a valid month for school administration start date",
                     "Enter a valid year for school administration start date",
                     "Enter a valid day for school administration end date",
                     "Enter a valid month for school administration end date",
                     "Enter a valid year for school administration end date",
                     "Enter a valid day for try it out start date",
                     "Enter a valid month for try it out start date",
                     "Enter a valid year for try it out start date",
                     "Enter a valid day for try it out end date",
                     "Enter a valid month for try it out end date",
                     "Enter a valid year for try it out end date",
                     "Enter a valid day for multiplication tables check start date",
                     "Enter a valid month for multiplication tables check start date",
                     "Enter a valid year for multiplication tables check start date",
                     "Enter a valid day for multiplication tables check end date",
                     "Enter a valid month for multiplication tables check end date",
                     "Enter a valid year for multiplication tables check end date"]
  expect(add_edit_check_window_v2_page).to have_error_summary
  expect(add_edit_check_window_v2_page.error_summary).to have_error_text
  expect(add_edit_check_window_v2_page.error_summary.error_messages.map {|error| error.text}).to eql array_of_errors
  expect(add_edit_check_window_v2_page.error_messages.map {|error| error.text}).to eql array_of_errors
end

When(/^I enter all the days for each of the dates with more than (\d+) digits$/) do |arg|
  today_date = Date.today
  @admin_start_date = today_date.next_year(5) + 3
  @admin_end_date = today_date.next_year(5) + 11
  @familiarisation_start_date = today_date.next_year(5) + 4
  @familiarisation_end_date = today_date.next_year(5) + 10
  @live_start_date = today_date.next_year(5) + 4
  @live_end_date = today_date.next_year(5) + 10
  check_window_name = "TestCheck-#{today_date.day}-#{today_date.month}-#{today_date.year}-#{rand(1..10000)}"
  @check_window_hash = {check_name: check_window_name,
                        admin_start_day: '111',
                        admin_start_month: @admin_start_date.month,
                        admin_start_year: @admin_start_date.year,
                        admin_end_day: '111',
                        admin_end_month: @admin_end_date.month,
                        admin_end_year: @admin_end_date.year,
                        familiarisation_start_day: '111',
                        familiarisation_start_month: @familiarisation_start_date.month,
                        familiarisation_start_year: @familiarisation_start_date.year,
                        familiarisation_end_day: '111',
                        familiarisation_end_month: @familiarisation_end_date.month,
                        familiarisation_end_year: @familiarisation_end_date.year,
                        live_start_day: '111',
                        live_start_month: @live_start_date.month,
                        live_start_year: @live_start_date.year,
                        live_end_day: '111',
                        live_end_month: @live_end_date.month,
                        live_end_year: @live_end_date.year
  }
  add_edit_check_window_v2_page.enter_details(@check_window_hash)
  add_edit_check_window_v2_page.save_changes.click
end

Then(/^I should see an error stating I should enter only (\d+) digits$/) do |arg|
  array_of_errors = ["Enter a day in 2 digits for school administration start date",
                     "Enter a day in 2 digits for school administration end date",
                     "Enter a day in 2 digits for try it out start date",
                     "Enter a day in 2 digits for try it out end date",
                     "Enter a day in 2 digits for multiplication tables check start date",
                     "Enter a day in 2 digits for multiplication tables check end date"]
  expect(add_edit_check_window_v2_page).to have_error_summary
  expect(add_edit_check_window_v2_page.error_summary).to have_error_text
  expect(add_edit_check_window_v2_page.error_summary.error_messages.map {|error| error.text}).to eql array_of_errors
  expect(add_edit_check_window_v2_page.error_messages.map {|error| error.text}).to eql array_of_errors
end

When(/^I enter all the days for each of the dates with an invalid day in a month$/) do
  today_date = Date.today
  @admin_start_date = today_date.next_year(5) + 3
  @admin_end_date = today_date.next_year(5) + 11
  @familiarisation_start_date = today_date.next_year(5) + 4
  @familiarisation_end_date = today_date.next_year(5) + 10
  @live_start_date = today_date.next_year(5) + 4
  @live_end_date = today_date.next_year(5) + 10
  check_window_name = "TestCheck-#{today_date.day}-#{today_date.month}-#{today_date.year}-#{rand(1..10000)}"
  @check_window_hash = {check_name: check_window_name,
                        admin_start_day: '39',
                        admin_start_month: @admin_start_date.month,
                        admin_start_year: @admin_start_date.year,
                        admin_end_day: '39',
                        admin_end_month: @admin_end_date.month,
                        admin_end_year: @admin_end_date.year,
                        familiarisation_start_day: '39',
                        familiarisation_start_month: @familiarisation_start_date.month,
                        familiarisation_start_year: @familiarisation_start_date.year,
                        familiarisation_end_day: '39',
                        familiarisation_end_month: @familiarisation_end_date.month,
                        familiarisation_end_year: @familiarisation_end_date.year,
                        live_start_day: '39',
                        live_start_month: @live_start_date.month,
                        live_start_year: @live_start_date.year,
                        live_end_day: '39',
                        live_end_month: @live_end_date.month,
                        live_end_year: @live_end_date.year
  }
  add_edit_check_window_v2_page.enter_details(@check_window_hash)
  add_edit_check_window_v2_page.save_changes.click
end

Then(/^I should see an error stating I should enter a valid day$/) do
  array_of_errors = ["Enter a valid day for school administration start date",
                     "Enter a valid day for school administration end date",
                     "Enter a valid day for try it out start date",
                     "Enter a valid day for try it out end date",
                     "Enter a valid day for multiplication tables check start date",
                     "Enter a valid day for multiplication tables check end date"]
  expect(add_edit_check_window_v2_page).to have_error_summary
  expect(add_edit_check_window_v2_page.error_summary).to have_error_text
  expect(add_edit_check_window_v2_page.error_summary.error_messages.map {|error| error.text}).to eql array_of_errors
  expect(add_edit_check_window_v2_page.error_messages.map {|error| error.text}).to eql array_of_errors
end

When(/^I enter all the months for each of the dates with more than (\d+) digits$/) do |arg|
  today_date = Date.today
  @admin_start_date = today_date.next_year(5) + 3
  @admin_end_date = today_date.next_year(5) + 11
  @familiarisation_start_date = today_date.next_year(5) + 4
  @familiarisation_end_date = today_date.next_year(5) + 10
  @live_start_date = today_date.next_year(5) + 4
  @live_end_date = today_date.next_year(5) + 10
  check_window_name = "TestCheck-#{today_date.day}-#{today_date.month}-#{today_date.year}-#{rand(1..10000)}"
  @check_window_hash = {check_name: check_window_name,
                        admin_start_day: @admin_start_date.day,
                        admin_start_month: '122',
                        admin_start_year: @admin_start_date.year,
                        admin_end_day: @admin_end_date.day,
                        admin_end_month: '122',
                        admin_end_year: @admin_end_date.year,
                        familiarisation_start_day: @familiarisation_start_date.day,
                        familiarisation_start_month: '122',
                        familiarisation_start_year: @familiarisation_start_date.year,
                        familiarisation_end_day: @familiarisation_end_date.day,
                        familiarisation_end_month: '122',
                        familiarisation_end_year: @familiarisation_end_date.year,
                        live_start_day: @live_start_date.day,
                        live_start_month: '122',
                        live_start_year: @live_start_date.year,
                        live_end_day: @live_end_date.day,
                        live_end_month: '122',
                        live_end_year: @live_end_date.year
  }
  add_edit_check_window_v2_page.enter_details(@check_window_hash)
  add_edit_check_window_v2_page.save_changes.click
end

Then(/^I should see an error stating I should enter only (\d+) digits for the month$/) do |arg|
  array_of_errors = ["Enter a month in 2 digits for school administration start date",
                     "Enter a month in 2 digits for school administration end date",
                     "Enter a month in 2 digits for try it out start date",
                     "Enter a month in 2 digits for try it out end date",
                     "Enter a month in 2 digits for multiplication tables check start date",
                     "Enter a month in 2 digits for multiplication tables check end date"]
  expect(add_edit_check_window_v2_page).to have_error_summary
  expect(add_edit_check_window_v2_page.error_summary).to have_error_text
  expect(add_edit_check_window_v2_page.error_summary.error_messages.map {|error| error.text}).to eql array_of_errors
  expect(add_edit_check_window_v2_page.error_messages.map {|error| error.text}).to eql array_of_errors
end

When(/^I enter all the months for each of the dates with an invalid month in a year$/) do
  today_date = Date.today
  @admin_start_date = today_date.next_year(5) + 3
  @admin_end_date = today_date.next_year(5) + 11
  @familiarisation_start_date = today_date.next_year(5) + 4
  @familiarisation_end_date = today_date.next_year(5) + 10
  @live_start_date = today_date.next_year(5) + 4
  @live_end_date = today_date.next_year(5) + 10
  check_window_name = "TestCheck-#{today_date.day}-#{today_date.month}-#{today_date.year}-#{rand(1..10000)}"
  @check_window_hash = {check_name: check_window_name,
                        admin_start_day: @admin_start_date.day,
                        admin_start_month: '13',
                        admin_start_year: @admin_start_date.year,
                        admin_end_day: @admin_end_date.day,
                        admin_end_month: '13',
                        admin_end_year: @admin_end_date.year,
                        familiarisation_start_day: @familiarisation_start_date.day,
                        familiarisation_start_month: '13',
                        familiarisation_start_year: @familiarisation_start_date.year,
                        familiarisation_end_day: @familiarisation_end_date.day,
                        familiarisation_end_month: '13',
                        familiarisation_end_year: @familiarisation_end_date.year,
                        live_start_day: @live_start_date.day,
                        live_start_month: '13',
                        live_start_year: @live_start_date.year,
                        live_end_day: @live_end_date.day,
                        live_end_month: '13',
                        live_end_year: @live_end_date.year
  }
  add_edit_check_window_v2_page.enter_details(@check_window_hash)
  add_edit_check_window_v2_page.save_changes.click
end

Then(/^I should see an error stating I should enter a valid month$/) do
  array_of_errors = ["Enter a valid month for school administration start date",
                     "Enter a valid month for school administration end date",
                     "Enter a valid month for try it out start date",
                     "Enter a valid month for try it out end date",
                     "Enter a valid month for multiplication tables check start date",
                     "Enter a valid month for multiplication tables check end date"]
  expect(add_edit_check_window_v2_page).to have_error_summary
  expect(add_edit_check_window_v2_page.error_summary).to have_error_text
  expect(add_edit_check_window_v2_page.error_summary.error_messages.map {|error| error.text}).to eql array_of_errors
  expect(add_edit_check_window_v2_page.error_messages.map {|error| error.text}).to eql array_of_errors
end

When(/^I enter all the years for each of the dates with more than (\d+) digits$/) do |arg|
  today_date = Date.today
  @admin_start_date = today_date.next_year(5) + 3
  @admin_end_date = today_date.next_year(5) + 11
  @familiarisation_start_date = today_date.next_year(5) + 4
  @familiarisation_end_date = today_date.next_year(5) + 10
  @live_start_date = today_date.next_year(5) + 4
  @live_end_date = today_date.next_year(5) + 10
  check_window_name = "TestCheck-#{today_date.day}-#{today_date.month}-#{today_date.year}-#{rand(1..10000)}"
  @check_window_hash = {check_name: check_window_name,
                        admin_start_day: @admin_start_date.day,
                        admin_start_month: @admin_start_date.month,
                        admin_start_year: '20189',
                        admin_end_day: @admin_end_date.day,
                        admin_end_month: @admin_end_date.month,
                        admin_end_year: '20189',
                        familiarisation_start_day: @familiarisation_start_date.day,
                        familiarisation_start_month: @familiarisation_start_date.month,
                        familiarisation_start_year: '20189',
                        familiarisation_end_day: @familiarisation_end_date.day,
                        familiarisation_end_month: @familiarisation_end_date.month,
                        familiarisation_end_year: '20189',
                        live_start_day: @live_start_date.day,
                        live_start_month: @live_start_date.month,
                        live_start_year: '20189',
                        live_end_day: @live_end_date.day,
                        live_end_month: @live_end_date.month,
                        live_end_year: '20189'
  }
  add_edit_check_window_v2_page.enter_details(@check_window_hash)
  add_edit_check_window_v2_page.save_changes.click
end

Then(/^I should see an error stating I should enter only (\d+) digits for the year$/) do |arg|
  array_of_errors = ["Enter a year in 4 digits for school administration start date",
                     "Enter a year in 4 digits for school administration end date",
                     "Enter a year in 4 digits for try it out start date",
                     "Enter a year in 4 digits for try it out end date",
                     "Enter a year in 4 digits for multiplication tables check start date",
                     "Enter a year in 4 digits for multiplication tables check end date"]
  expect(add_edit_check_window_v2_page).to have_error_summary
  expect(add_edit_check_window_v2_page.error_summary).to have_error_text
  expect(add_edit_check_window_v2_page.error_summary.error_messages.map {|error| error.text}).to eql array_of_errors
  expect(add_edit_check_window_v2_page.error_messages.map {|error| error.text}).to eql array_of_errors
end

When(/^I enter all the years for each of the dates with an invalid year$/) do
  today_date = Date.today
  @admin_start_date = today_date.years_ago(20)
  @admin_end_date = @admin_start_date + 11
  @familiarisation_start_date = @admin_start_date + 4
  @familiarisation_end_date = @admin_start_date + 10
  @live_start_date = @admin_start_date + 4
  @live_end_date = @admin_start_date + 10
  check_window_name = "TestCheck-#{today_date.day}-#{today_date.month}-#{today_date.year}-#{rand(1..10000)}"
  @check_window_hash = {check_name: check_window_name,
                        admin_start_day: @admin_start_date.day,
                        admin_start_month: @admin_start_date.month,
                        admin_start_year: @admin_start_date.year,
                        admin_end_day: @admin_end_date.day,
                        admin_end_month: @admin_end_date.month,
                        admin_end_year: @admin_end_date.year,
                        familiarisation_start_day: @familiarisation_start_date.day,
                        familiarisation_start_month: @familiarisation_start_date.month,
                        familiarisation_start_year: @familiarisation_start_date.year,
                        familiarisation_end_day: @familiarisation_end_date.day,
                        familiarisation_end_month: @familiarisation_end_date.month,
                        familiarisation_end_year: @familiarisation_end_date.year,
                        live_start_day: @live_start_date.day,
                        live_start_month: @live_start_date.month,
                        live_start_year: @live_start_date.year,
                        live_end_day: @live_end_date.day,
                        live_end_month: @live_end_date.month,
                        live_end_year: @live_end_date.year
  }
  add_edit_check_window_v2_page.enter_details(@check_window_hash)
  add_edit_check_window_v2_page.save_changes.click
end

Then(/^I should see an error stating I should enter a valid year$/) do
  array_of_summary_errors = ["Enter a valid year for school administration start date",
                             "Enter a valid year for school administration end date",
                             "Enter a valid year for try it out start date",
                             "Enter a valid year for try it out end date",
                             "Enter a valid year for multiplication tables check start date",
                             "Enter a valid year for multiplication tables check end date"]
  array_of_inline_errors = ["Enter a school administration start date in the future",
                            "Enter a valid year for school administration start date",
                            "Enter a school administration end date in the future",
                            "Enter a valid year for school administration end date",
                            "Enter a try it out start date in the future",
                            "Enter a valid year for try it out start date",
                            "Enter a try it out end date in the future",
                            "Enter a valid year for try it out end date",
                            "Enter a multiplication tables check start date in the future",
                            "Enter a valid year for multiplication tables check start date",
                            "Enter a multiplication tables check end date in the future",
                            "Enter a valid year for multiplication tables check end date"]
  expect(add_edit_check_window_v2_page).to have_error_summary
  expect(add_edit_check_window_v2_page).to have_warning_summary
  expect(add_edit_check_window_v2_page.error_summary).to have_error_text
  expect(add_edit_check_window_v2_page.error_summary.error_messages.map {|error| error.text}).to eql array_of_summary_errors
  expect(add_edit_check_window_v2_page.error_messages.map {|error| error.text}).to eql array_of_inline_errors
end

When(/^I enter a admin start date that is after the start dates for familiarisation and live check$/) do
  today_date = Date.today
  @admin_start_date = today_date.next_year(5) + 6
  @admin_end_date = today_date.next_year(5) + 11
  @familiarisation_start_date = today_date.next_year(5) + 5
  @familiarisation_end_date = today_date.next_year(5) + 10
  @live_start_date = today_date.next_year(5) + 5
  @live_end_date = today_date.next_year(5) + 10
  check_window_name = "TestCheck-#{today_date.day}-#{today_date.month}-#{today_date.year}-#{rand(1..10000)}"
  @check_window_hash = {check_name: check_window_name,
                        admin_start_day: @admin_start_date.day,
                        admin_start_month: @admin_start_date.month,
                        admin_start_year: @admin_start_date.year,
                        admin_end_day: @admin_end_date.day,
                        admin_end_month: @admin_end_date.month,
                        admin_end_year: @admin_end_date.year,
                        familiarisation_start_day: @familiarisation_start_date.day,
                        familiarisation_start_month: @familiarisation_start_date.month,
                        familiarisation_start_year: @familiarisation_start_date.year,
                        familiarisation_end_day: @familiarisation_end_date.day,
                        familiarisation_end_month: @familiarisation_end_date.month,
                        familiarisation_end_year: @familiarisation_end_date.year,
                        live_start_day: @live_start_date.day,
                        live_start_month: @live_start_date.month,
                        live_start_year: @live_start_date.year,
                        live_end_day: @live_end_date.day,
                        live_end_month: @live_end_date.month,
                        live_end_year: @live_end_date.year
  }
  add_edit_check_window_v2_page.enter_details(@check_window_hash)
  add_edit_check_window_v2_page.save_changes.click
end

Then(/^I should see an error stating the admin start date must be before the start dates for familiarisation and live check$/) do
  expect(add_edit_check_window_v2_page).to have_error_summary
  expect(add_edit_check_window_v2_page.error_summary).to have_error_text
  expect(add_edit_check_window_v2_page.error_messages.map {|error| error.text}).to eql ["Enter a school administration start date which is before or on the same day as the try it out start date",
                                                                                        "Enter a school administration start date which is before the multiplication tables check start date",
                                                                                        "Enter a try it out start date which is the same date or after the administration start date",
                                                                                        "Enter a multiplication tables check start date which is the same date or after the administration start date"]
end


When(/^I enter a live end date that is before the admin start date$/) do
  today_date = Date.today
  @admin_start_date = today_date.next_year(5) + 6
  @admin_end_date = today_date.next_year(5) + 11
  @familiarisation_start_date = today_date.next_year(5) + 7
  @familiarisation_end_date = today_date.next_year(5) + 8
  @live_start_date = today_date.next_year(5) + 7
  @live_end_date = today_date.next_year(5) + 5
  check_window_name = "TestCheck-#{today_date.day}-#{today_date.month}-#{today_date.year}-#{rand(1..10000)}"
  @check_window_hash = {check_name: check_window_name,
                        admin_start_day: @admin_start_date.day,
                        admin_start_month: @admin_start_date.month,
                        admin_start_year: @admin_start_date.year,
                        admin_end_day: @admin_end_date.day,
                        admin_end_month: @admin_end_date.month,
                        admin_end_year: @admin_end_date.year,
                        familiarisation_start_day: @familiarisation_start_date.day,
                        familiarisation_start_month: @familiarisation_start_date.month,
                        familiarisation_start_year: @familiarisation_start_date.year,
                        familiarisation_end_day: @familiarisation_end_date.day,
                        familiarisation_end_month: @familiarisation_end_date.month,
                        familiarisation_end_year: @familiarisation_end_date.year,
                        live_start_day: @live_start_date.day,
                        live_start_month: @live_start_date.month,
                        live_start_year: @live_start_date.year,
                        live_end_day: @live_end_date.day,
                        live_end_month: @live_end_date.month,
                        live_end_year: @live_end_date.year
  }
  add_edit_check_window_v2_page.enter_details(@check_window_hash)
  add_edit_check_window_v2_page.save_changes.click
end

Then(/^I should see an error stating live end date must occur after admin start date$/) do
  expect(add_edit_check_window_v2_page).to have_error_summary
  expect(add_edit_check_window_v2_page.error_summary).to have_error_text
  expect(add_edit_check_window_v2_page.error_messages.map {|error| error.text}).to eql ["Enter a try it out end date which is the same as multiplication tables check end date",
                                                                                        "Enter a multiplication tables check start date which is before the multiplication tables check end date",
                                                                                        "Enter a multiplication tables check end date which is the same date or after the multiplication tables check start date",
                                                                                        "Enter a multiplication tables check end date which is the same date or after the administration start date",
                                                                                        "Enter a multiplication tables check end date which is the same as try it out end date"]
end

When(/^I enter a familirisation end date that is before the admin start date$/) do
  today_date = Date.today
  @admin_start_date = today_date.next_year(5) + 6
  @admin_end_date = today_date.next_year(5) + 11
  @familiarisation_start_date = today_date.next_year(5) + 7
  @familiarisation_end_date = today_date.next_year(5) + 5
  @live_start_date = today_date.next_year(5) + 7
  @live_end_date = today_date.next_year(5) + 8
  check_window_name = "TestCheck-#{today_date.day}-#{today_date.month}-#{today_date.year}-#{rand(1..10000)}"
  @check_window_hash = {check_name: check_window_name,
                        admin_start_day: @admin_start_date.day,
                        admin_start_month: @admin_start_date.month,
                        admin_start_year: @admin_start_date.year,
                        admin_end_day: @admin_end_date.day,
                        admin_end_month: @admin_end_date.month,
                        admin_end_year: @admin_end_date.year,
                        familiarisation_start_day: @familiarisation_start_date.day,
                        familiarisation_start_month: @familiarisation_start_date.month,
                        familiarisation_start_year: @familiarisation_start_date.year,
                        familiarisation_end_day: @familiarisation_end_date.day,
                        familiarisation_end_month: @familiarisation_end_date.month,
                        familiarisation_end_year: @familiarisation_end_date.year,
                        live_start_day: @live_start_date.day,
                        live_start_month: @live_start_date.month,
                        live_start_year: @live_start_date.year,
                        live_end_day: @live_end_date.day,
                        live_end_month: @live_end_date.month,
                        live_end_year: @live_end_date.year
  }
  add_edit_check_window_v2_page.enter_details(@check_window_hash)
  add_edit_check_window_v2_page.save_changes.click
end

Then(/^I should see an error stating familirisation end date must occur after admin start date$/) do
  expect(add_edit_check_window_v2_page).to have_error_summary
  expect(add_edit_check_window_v2_page.error_summary).to have_error_text
  expect(add_edit_check_window_v2_page.error_messages.map {|error| error.text}).to eql ["Enter a try it out start date which is the same date or before the try it out end date",
                                                                                        "Enter a try it out end date which is the same date or after the administration start date",
                                                                                        "Enter a try it out end date which is the same date or after the try it out start date",
                                                                                        "Enter a try it out end date which is the same as multiplication tables check end date",
                                                                                        "Enter a multiplication tables check end date which is the same as try it out end date"]
end
