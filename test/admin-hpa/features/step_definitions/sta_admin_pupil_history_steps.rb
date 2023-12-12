When(/^I view a pupils history$/) do
  pupil_register_page.load
  @pupil_details = SqlDbHelper.pupil_details(@upns_for_school.sample, @school_id)
  pupil_name = @pupil_details['lastName']
  pupil_row = pupil_register_page.find_pupil_row(pupil_name)
  pupil_row.view_history.click

end

Then('I should not see any check history') do
  expect(pupil_history_page.check_history.rows).to be_empty
end

Then('I should see the pupils history') do
  expect(pupil_history_page.pupil_name.text).to eql @pupil_details['lastName'] + ', ' + @pupil_details['foreName'] + ' ' + @pupil_details['middleNames']
  expect(pupil_history_page.pupil_history.dob.text).to eql @pupil_details['dateOfBirth'].strftime("%-d %B %Y")
  expect(pupil_history_page.pupil_history.upn.text).to eql @pupil_details['upn']
  expect(pupil_history_page.pupil_history.gender.text).to eql @pupil_details['gender']
  expect(pupil_history_page.pupil_history.complete.text).to eql 'N'
  expect(pupil_history_page.pupil_history.not_taking_check.text).to eql 'n/a'
  expect(pupil_history_page.pupil_history.restart_available.text).to eql 'N'
  expect(pupil_history_page.pupil_history.number_of_restarts_taken.text).to eql '0'
  expect(pupil_history_page.pupil_history.discretionary_restart.text).to eql 'N'
end

When(/^I view the pupils history using the (sta admin|helpdesk) role$/) do |role|
  visit ENV['ADMIN_BASE_URL'] + '/sign-out'
  step "I am on the school landing page for a school using an account with the #{role} role"
  pupil_register_page.load
  @pupil_details = SqlDbHelper.pupil_details(@details_hash[:upn], @school_id)
  pupil_name = @pupil_details['lastName']
  pupil_row = pupil_register_page.find_pupil_row(pupil_name)
  pupil_row.view_history.click
end

Then(/^I should see this reflected in the pupils attendance history$/) do
  expect(pupil_history_page.pupil_history.not_taking_check.text).to eql 'Not taking the check'
end

Then(/^I should see this reflected in the pupils restarts history$/) do
  expect(pupil_history_page.important_banner.message.text).to eql 'A restart has been applied to the pupil, but has not yet been used to generate a new pin.'
  expect(pupil_history_page.pupil_history.restart_available.text).to eql 'Y'
  expect(pupil_history_page.pupil_history.number_of_restarts_taken.text).to eql SqlDbHelper.count_restarts_taken_for_pupil(@pupil_details['id']).to_s
  expect(pupil_history_page.pupil_history.discretionary_restart.text).to eql 'N'
end


Given(/^I have a pupil who has the max number of restarts$/) do
  step 'I submitted pupils for Restart'
  step 'Pupil has taken a 3rd check'
end

And(/^I apply the discretionary restart$/) do
  pupil_history_page.discretionary_restart_button.click
end

Then(/^I should see this discretionary restart reflected in the pupils restart history$/) do
  expect(pupil_history_page.important_banner.message.text).to eql 'A discretionary restart permission has been applied to the pupil, but has not yet been used to generate a restart.'
  expect(pupil_history_page.pupil_history.restart_available.text).to eql 'N'
  expect(pupil_history_page.pupil_history.number_of_restarts_taken.text).to eql '2'
  expect(pupil_history_page.pupil_history.discretionary_restart.text).to eql 'Y'
  expect(pupil_history_page).to have_remove_discretionary_restart_button
  step "the pupil should be available for a restart"
end


Given(/^I have a pupil who has a discretionary restart$/) do
  step "I have a pupil who has the max number of restarts"
  step "I view the pupils history using the sta admin role"
  step "I apply the discretionary restart"
end

When(/^I remove the discretionary restart$/) do
  pupil_history_page.remove_discretionary_restart_button.click
end


Then(/^I should see the removal of the discretionary restart reflected in the pupils restart history$/) do
  expect(pupil_history_page.pupil_history.discretionary_restart.text).to eql 'N'
  expect(pupil_history_page).to have_discretionary_restart_button
  expect(pupil_history_page).to_not have_remove_discretionary_restart_button
  step 'I am on the Restarts Page'
  expect(restarts_page).to have_no_pupils
end


Then(/^I should see the pin gen reflected in the check history$/) do
  check_details = SqlDbHelper.check_details(@pupil_details['id'])
  expect(pupil_history_page.check_history.rows.first.pin_gen.text).to eql check_details['createdAt'].utc.strftime("%-d %b %l:%M %P").gsub("  ", " ")
  expect(pupil_history_page.check_history.rows.first.login.text).to eql ""
  expect(pupil_history_page.check_history.rows.first.recieved.text).to eql @check_type == 'Official' ? '' : 'n/a'
  expect(pupil_history_page.check_history.rows.first.active.text).to eql @check_type == 'Official' ? '*' : ''
  expect(pupil_history_page.check_history.rows.first.type.text).to eql @check_type
  expect(pupil_history_page.check_history.rows.first.status.text).to eql "Pin generated"
end

Given(/^pupil has logged in to a (.+) check$/) do |check_type|
  step "a #{check_type} pin has been generated for a pupil"
  pupil_detail = SqlDbHelper.pupil_details(@details_hash[:upn], @school_id)
  @pupil_id = pupil_detail['id']
  check_entry = SqlDbHelper.check_details(@pupil_id)
  pupil_pin_detail = SqlDbHelper.get_pupil_pin(check_entry['id'])
  pupil_pin = pupil_pin_detail['val']
  school_password = SqlDbHelper.find_school(pupil_detail['school_id'])['pin']
  Timeout.timeout(ENV['WAIT_TIME'].to_i) {sleep 1 until RequestHelper.auth(school_password, pupil_pin).code == 200}
  RequestHelper.auth(school_password, pupil_pin)
end

Then(/^I should see the pupil login reflected in the check history$/) do
  check_details = SqlDbHelper.check_details(@pupil_details['id'])
  expect(pupil_history_page.check_history.rows.first.pin_gen.text).to eql check_details['createdAt'].utc.strftime("%-d %b %l:%M %P").gsub("  ", " ")
  expect(pupil_history_page.check_history.rows.first.login.text).to eql check_details['pupilLoginDate'].utc.strftime("%-d %b %l:%M %P").gsub("  ", " ")
  expect(pupil_history_page.check_history.rows.first.recieved.text).to eql @check_type == 'Official' ? '' : 'n/a'
  expect(pupil_history_page.check_history.rows.first.active.text).to eql @check_type == 'Official' ? '*' : ''
  expect(pupil_history_page.check_history.rows.first.type.text).to eql @check_type
  expect(pupil_history_page.check_history.rows.first.status.text).to eql "Logged in"
end


Given(/^a (.+) pin has been generated for a pupil$/) do |check_type|
  @check_type = check_type
  case @check_type
  when "Official"
    step "I have generated a live pin for a pupil"
  when "Try it out"
    step "I have generated a familiarisation pin for a pupil"
  else
    raise @check_type + " not recognised"
  end
end


Given(/^a pupil has completed the (.+) check$/) do |check_type|
  step "a #{check_type} pin has been generated for a pupil"
  step 'pupil logs in and completed the check'
end


Then(/^I should see the completed check reflected in the check history$/) do
  check_details = SqlDbHelper.check_details(@pupil_details['id'])
  expect(pupil_history_page.check_history.rows.first.pin_gen.text).to eql check_details['createdAt'].utc.strftime("%-d %b %l:%M %P").gsub("  ", " ")
  expect(pupil_history_page.check_history.rows.first.login.text).to eql check_details['pupilLoginDate'].utc.strftime("%-d %b %l:%M %P").gsub("  ", " ")
  expect(pupil_history_page.check_history.rows.first.recieved.text).to eql @check_type == 'Official' ? check_details['receivedByServerAt'].utc.strftime("%-d %b %l:%M %P").gsub("  ", " ") : 'n/a'
  expect(pupil_history_page.check_history.rows.first.active.text).to eql @check_type == 'Official' ? '*' : ''
  expect(pupil_history_page.check_history.rows.first.type.text).to eql @check_type
  expect(pupil_history_page.check_history.rows.first.status.text).to eql @check_type == 'Official' ? "Check complete" : 'Logged in'
end


Given(/^I have a pupil who has taken (\d+) checks$/) do |arg|
  step 'I submitted pupils for Restart'
  sleep 60
  step 'Pupil has taken a 2nd restart'
  sleep 60
  step 'Pupil has taken a 2nd check'
end


Then(/^I should see a list of all checks with the latest being marked as active$/) do
  pupil_checks = SqlDbHelper.get_all_checks_from_school(@school_id).select {|check| check['pupil_id'] == @pupil_details['id']}.sort_by {|check| check['id']}
  latest_check = pupil_checks.last
  pupil_history_page.check_history.rows.each_with_index do |check, index|
    expect(check.pin_gen.text).to eql pupil_checks[index]['createdAt'].utc.strftime("%-d %b %l:%M %P").gsub("  ", " ")
    expect(check.login.text).to eql pupil_checks[index]['pupilLoginDate'].utc.strftime("%-d %b %l:%M %P").gsub("  ", " ")
    expect(check.recieved.text).to eql pupil_checks[index]['receivedByServerAt'].utc.strftime("%-d %b %l:%M %P").gsub("  ", " ")
    expect(check.active.text).to eql pupil_checks[index] == latest_check ? '*' : ''
    expect(check.type.text).to eql 'Official'
    expect(check.status.text).to eql 'Check complete'
  end
end


Given(/^a pupil has consumed a discretionary restart$/) do
  step "I have a pupil who has taken 3 checks"
  step "I view the pupils history using the sta admin role"
  step "I apply the discretionary restart"
  step 'I am on the Restarts Page'
  step 'I select a pupil for restarts'
  restarts_page.reason_1.click
  restarts_page.sticky_banner.confirm.click
  expect(restarts_page).to have_flash_message
  navigate_to_pupil_list_for_pin_gen('live')
  generate_live_pins_overview_page.generate_pin_using_name(@pupil_name)
  pupil_pin_row = view_and_print_live_pins_page.pupil_list.rows.find {|row| row.name.text == @pupil_name}
  @pupil_credentials = {:school_password => pupil_pin_row.school_password.text, :pin => pupil_pin_row.pin.text}
  RequestHelper.auth(@pupil_credentials[:school_password], @pupil_credentials[:pin])
  check_entry = SqlDbHelper.check_details(@pupil_id)
  @check_code = check_entry['checkCode']
  FunctionsHelper.complete_check_via_check_code([@check_code]) if check_entry["isLiveCheck"]
  AzureTableHelper.wait_for_received_check(@school['entity']['urlSlug'], @check_code) if check_entry["isLiveCheck"]
end


Then(/^I should see a list of all checks including the consumed discretionary restart$/) do
  expect(pupil_history_page.pupil_history.number_of_restarts_taken.text).to eql '3'
  expect(pupil_history_page.pupil_history.discretionary_restart.text).to eql 'N'
  expect(pupil_history_page).to have_discretionary_restart_button
  pupil_checks = SqlDbHelper.get_all_checks_from_school(@school_id).select {|check| check['pupil_id'] == @pupil_details['id']}.sort_by {|check| check['id']}
  latest_check = pupil_checks.last
  pupil_history_page.check_history.rows.each_with_index do |check, index|
    expect(check.pin_gen.text).to eql pupil_checks[index]['createdAt'].utc.strftime("%-d %b %l:%M %P").gsub("  ", " ")
    expect(check.login.text).to eql pupil_checks[index]['pupilLoginDate'].utc.strftime("%-d %b %l:%M %P").gsub("  ", " ")
    expect(check.recieved.text).to eql pupil_checks[index]['receivedByServerAt'].utc.strftime("%-d %b %l:%M %P").gsub("  ", " ")
    expect(check.active.text).to eql pupil_checks[index] == latest_check ? '*' : ''
    expect(check.type.text).to eql 'Official'
    expect(check.status.text).to eql 'Check complete'
  end
end

And(/^I should not have the ability to apply a discretionary restart$/) do
  expect(pupil_history_page).to_not have_discretionary_restart_button
end

Then(/^I should not have the ability to remove the discretionary restart$/) do
  expect(pupil_history_page).to_not have_remove_discretionary_restart_button
end

Then(/^I should see a list of all checks including the consumed discretionary restart in the helpdesk view$/) do
  expect(pupil_history_page.pupil_history.number_of_restarts_taken.text).to eql '3'
  expect(pupil_history_page.pupil_history.discretionary_restart.text).to eql 'N'
  pupil_checks = SqlDbHelper.get_all_checks_from_school(@school_id).select {|check| check['pupil_id'] == @pupil_details['id']}.sort_by {|check| check['id']}
  latest_check = pupil_checks.last
  pupil_history_page.check_history.rows.each_with_index do |check, index|
    expect(check.pin_gen.text).to eql pupil_checks[index]['createdAt'].utc.strftime("%-d %b %l:%M %P").gsub("  ", " ")
    expect(check.login.text).to eql pupil_checks[index]['pupilLoginDate'].utc.strftime("%-d %b %l:%M %P").gsub("  ", " ")
    expect(check.recieved.text).to eql pupil_checks[index]['receivedByServerAt'].utc.strftime("%-d %b %l:%M %P").gsub("  ", " ")
    expect(check.active.text).to eql pupil_checks[index] == latest_check ? '*' : ''
    expect(check.type.text).to eql 'Official'
    expect(check.status.text).to eql 'Check complete'
  end
end
