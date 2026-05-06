Given(/^I am on the Restarts Page$/) do
  restarts_page.load
  restarts_page.select_pupil_to_restart_btn.click
  @page = restarts_page
end

When(/^I navigate to Restarts page$/) do
  school_landing_page.restarts.click
end

Then(/^I should see a heading for the Restarts page$/) do
  expect(restarts_page).to have_heading
end

And(/^I can see the info message for Restarts$/) do
  expect(restarts_page).to have_restarts_message
end

Then(/^I should see a way to add a reason for restarts$/) do
  expect(restarts_page).to have_select_pupil_to_restart_btn
end

Then(/^I should be able to go back to the top of restarts page$/) do
  expect(restarts_page).to have_back_to_top
end

When(/^I want to add a reason for restarts$/) do
  restarts_page.select_pupil_to_restart_btn.click
end

Then(/^I should see set of reasons I can choose for restarts$/) do
  expect(restarts_page).to have_reasons_list
end

Then(/^I should see a section that explains the reasons for restarts$/) do
  expect(restarts_page.explanation_section).to be_all_there
end

Then(/^I should be able to select them via a checkbox for restarts$/) do
  restarts_page.pupil_list.rows.each {|pupil| expect(pupil).to have_checkbox}
end

Then(/^I should have a option to select all pupils for restarts$/) do
  expect(restarts_page).to have_select_all_pupils
end

Then(/^I should not see a sticky banner on restarts page$/) do
  expect(restarts_page.sticky_banner).to_not be_visible
end

And(/^I select a reason for restarts$/) do
  restarts_page.reason_1.click
end

And(/^I submit the pupil for restart with a reason 'Did not complete' for restarts$/) do
  restarts_page.reason_4.click
  step 'I select a pupil for restarts'
  restarts_page.sticky_banner.confirm.click
end

When(/^I select a pupil for restarts$/) do
  pupil = restarts_page.find_pupil_row(@details_hash[:first_name])
  @pupil_name = pupil.name.text
    pupil.checkbox.click
end

When(/^I select all pupils for Restarts$/) do
  step 'I select a reason for restarts'
  restarts_page.select_all_pupils.click
end

When(/^I select multiple pupils for restarts$/) do
  step 'I select a reason for restarts'
  page.execute_script "window.scrollBy(0,1000)"
  @pupils = restarts_page.pupil_list.rows.select {|row| row.has_no_selected?}
  @pupils[0..3].each {|pupil| pupil.checkbox.click}
  @pupil_names = @pupils[0..3].map {|pupil| pupil.name.text}
end

Then(/^I should see the confirm button enabled for restarts$/) do
  expect(restarts_page.sticky_banner.confirm.disabled?).to be_falsey
end

Then(/^I should be taken to the restarts page$/) do
  expect(restarts_page).to be_displayed
end

Given(/^I have single pupils for restart$/) do
  step 'I have generated a live pin for a pupil'
  step 'pupil logs in and completed the check'
  step 'I am on the Restarts Page'
end

Given(/^I have multiple pupils for restart$/) do
  step 'I have generated pins for multiple pupils'
  @pupil_names_arr.each do |pupil|
    pupil_lastname = pupil.split(',')[0]
    pupil_firstname = pupil.split(',')[1].split(' Date')[0].split(' ')[0]
    pupil_detail = SqlDbHelper.pupil_details_using_names(pupil_firstname, pupil_lastname, @school_id)
    pupil_id = pupil_detail['id']
    check_entry = SqlDbHelper.check_details(pupil_id)
    pupil_pin_detail = SqlDbHelper.get_pupil_pin(check_entry['id'])
    pupil_pin = pupil_pin_detail['val']
    school_password = SqlDbHelper.find_school(pupil_detail['school_id'])['pin']
    Timeout.timeout(ENV['WAIT_TIME'].to_i) {sleep 1 until RequestHelper.auth(school_password, pupil_pin).code == 200}
    RequestHelper.auth(school_password, pupil_pin)
    @check_code = check_entry['checkCode']
    FunctionsHelper.complete_check_via_check_code([@check_code])
    SqlDbHelper.wait_for_received_check(@check_code)
  end
  step 'I am on the Restarts Page'
end

Given(/^I submitted pupils for Restart$/) do
  step 'I have single pupils for restart'
  step 'I select a pupil for restarts'
  restarts_page.reason_1.click
  restarts_page.sticky_banner.confirm.click
  expect(restarts_page).to have_flash_message
end

Then(/^I should see a flash message to state the pupil has been submitted for restart$/) do
  expect(restarts_page).to have_flash_message
  expect(restarts_page.flash_message.text).to eql('Restart made for 1 pupil')
end

Then(/^I should see the error message for further information for 'Did not complete' reason$/) do
  expect(restarts_page.error_summary).to be_all_there
end

Then(/^I should see pupil is added to the pupil restarts list with status '(.*)'$/) do |restart_status|
  hightlighted_row = restarts_page.restarts_pupil_list.rows.find {|row| row.has_highlighted_pupil?}
  expect(hightlighted_row.text).to include("#{@pupil_name}")
  expect(hightlighted_row.status.text).to include(restart_status)
end

And(/^Pupil has taken a 2nd check$/) do
  navigate_to_pupil_list_for_pin_gen('live')
  @page = generate_live_pins_overview_page
  @pupil_name = generate_live_pins_overview_page.generate_pin_using_name(@details_hash[:first_name])

  step 'pupil logs in and completed the check'
  restarts_page.load
end

And(/^Pupil has taken a 2nd restart$/) do
  step 'Pupil has taken a 2nd check'
  # restarts_page.load
  restarts_page.select_pupil_to_restart_btn.click
  @page = restarts_page
  restarts_page.restarts_for_pupil(@details_hash[:first_name])
end

And(/^Pupil has taken a 3rd check$/) do
  step 'Pupil has taken a 2nd restart'
  step 'Pupil has taken a 2nd check'
end

Then(/^I should see the Restart Status '(.*)' for the pupil$/) do |restart_status|
  p @details_hash[:last_name], @details_hash[:first_name]
  restarts_page.load
  Timeout.timeout(ENV['WAIT_TIME'].to_i){visit current_url until (restarts_page.restarts_pupil_list.rows.find {|row| row.name.text.eql?("#{@details_hash[:last_name]}, #{@details_hash[:first_name]}")}).status.text == restart_status}
  pupil_row = restarts_page.restarts_pupil_list.rows.find {|row| row.name.text.eql?("#{@details_hash[:last_name]}, #{@details_hash[:first_name]}")}
  expect(pupil_row.status.text).to include(restart_status)
end

Then(/^the sticky banner should display the total pupil count$/) do
  total_pupil_count = restarts_page.pupil_list.rows.count
  expect(@page.sticky_banner.selected_count.text).to eql total_pupil_count.to_s
end

When(/^I remove restart for that pupil$/) do
  pupil_row = restarts_page.restarts_pupil_list.rows.find {|row| row.name.text.eql?("#{@details_hash[:last_name]}, #{@details_hash[:first_name]}")}
  pupil_row.remove_restart.click
  @time_removed = Time.now.utc
end

Then(/^I should see a flash message to state the pupil has been removed from restart$/) do
  expect(restarts_page).to have_flash_message
  expect(restarts_page.flash_message.text).to eql("Restart removed for #{@details_hash[:last_name]}, #{@details_hash[:first_name]}")
  pupil_id = SqlDbHelper.pupil_details_by_upn(@details_hash[:upn])['id']
  deleted_at = SqlDbHelper.find_pupil_restart(pupil_id)['deletedAt'].utc
  expect(deleted_at).to_not be_nil
  expect(@time_removed.strftime("%Y-%m-%d %H:%M")).to eql deleted_at.strftime("%Y-%m-%d %H:%M")

end

Then(/^I should not see this pupil removed from restart in Generate Pin Pupil list$/) do
  @pupil_forename = @details_hash[:first_name]
  navigate_to_pupil_list_for_pin_gen('live')
  step 'I cannot see this pupil in the list of Pupil on Generate Pin list page'
end

Given(/^pupil has started a check$/) do
  step 'I am logged in'
  step 'I am on the add pupil page'
  step 'I have submitted valid pupil details'
  step 'Pupil has taken a 2nd check'
end

When(/^they become eligable for a restart$/) do
  p @pupil_names_arr
  @pupil_names_arr.each do |pupil|
    pupil_lastname = pupil.split(',')[0]
    pupil_firstname = pupil.split(',')[1].split(' Date')[0].split(' ')[0]
    pupil_detail = SqlDbHelper.pupil_details_using_names(pupil_firstname, pupil_lastname, @school_id)
    pupil_id = pupil_detail['id']
    check_entry = SqlDbHelper.check_details(pupil_id)
    pupil_pin_detail = SqlDbHelper.get_pupil_pin(check_entry['id'])
    pupil_pin = pupil_pin_detail['val']
    school_password = SqlDbHelper.find_school(pupil_detail['school_id'])['pin']
    Timeout.timeout(ENV['WAIT_TIME'].to_i) {sleep 1 until RequestHelper.auth(school_password, pupil_pin).code == 200}
    RequestHelper.auth(school_password, pupil_pin)
    @check_code = check_entry['checkCode']
    FunctionsHelper.complete_check_via_check_code([@check_code])
    SqlDbHelper.wait_for_received_check(@check_code)
  end
  step 'I am on the Restarts Page'
end

Then(/^I should be able to filter the pupil list by the group$/) do
  Timeout.timeout(ENV['WAIT_TIME'].to_i) {visit current_url until !restarts_page.group_filter.groups.empty?}
  restarts_page.group_filter.closed_filter.click unless restarts_page.group_filter.has_opened_filter?
  group = restarts_page.group_filter.groups.find {|group| group.name.text.include? @group_name}
  group.checkbox.click
  filtered_pupils = restarts_page.pupil_list.rows.map {|row| row.name.text}.reject(&:empty?)
  expect(filtered_pupils.sort).to eql @pupil_names_arr.sort
end

And(/^I should be able to see the number of pupils in the group$/) do
  group = restarts_page.group_filter.groups.find {|group| group.name.text.include? @group_name}
  expect(group.count.text.scan(/\d/).join('').to_i).to eql @pupil_names_arr.size
end

When(/^I submit the pupil for restart with a reason 'Classroom disruption' for restarts$/) do
  restarts_page.reason_3.click
  step 'I select a pupil for restarts'
  restarts_page.sticky_banner.confirm.click
end

Then(/^I should see the error message for further information for 'Classroom disruption' reason$/) do
  expect(restarts_page.error_summary).to be_all_there
end

Given(/^I submitted pupils for Restart using reason Classroom disruption$/) do
  step 'I have single pupils for restart'
  step 'I select a pupil for restarts'
  restarts_page.reason_3.click
  restarts_page.sticky_banner.confirm.click
end

Then(/^I should see the restarts page matches design$/) do
  step 'I should see a heading for the Restarts page'
  step 'I can see the info message for Restarts'
  step 'I should see a way to add a reason for restarts'
  restarts_page.select_pupil_to_restart_btn.click
  step 'I should be able to go back to the top of restarts page'
  step 'I should see set of reasons I can choose for restarts'
  step 'I should see a section that explains the reasons for restarts'
  step 'I should not see a sticky banner on restarts page'

end

Given(/^pupil logs in and completed the check$/) do
  pupil_detail = SqlDbHelper.pupil_details(@details_hash[:upn], @school_id)
  @pupil_id = pupil_detail['id']
  @check_entry = SqlDbHelper.check_details(@pupil_id)
  pupil_pin_detail = SqlDbHelper.get_pupil_pin(@check_entry['id'])
  pupil_pin = pupil_pin_detail['val']
  school_password = SqlDbHelper.find_school(pupil_detail['school_id'])['pin']
  Timeout.timeout(ENV['WAIT_TIME'].to_i) {sleep 1 until RequestHelper.auth(school_password, pupil_pin).code == 200}
  RequestHelper.auth(school_password, pupil_pin)
  @check_code = @check_entry['checkCode']
  FunctionsHelper.complete_check_via_check_code([@check_code]) if @check_entry["isLiveCheck"]
  SqlDbHelper.wait_for_received_check(@check_code) if @check_entry["isLiveCheck"]
end

And(/^I generate a pin for that pupil$/) do
  navigate_to_pupil_list_for_pin_gen('live')
  @pupil_name = generate_live_pins_overview_page.generate_pin_using_name(@details_hash[:first_name])
end

And(/^I navigate to the restarts page$/) do
  restarts_page.load
end

And(/^the pin should also be removed$/) do
  view_and_print_live_pins_page.load
  array_of_names = view_and_print_live_pins_page.pupil_list.rows.map {|row| row.name.text} unless view_and_print_live_pins_page.has_no_pupil_list?
  expect(array_of_names).to_not include @details_hash[:first_name] if view_and_print_live_pins_page.has_pupil_list?
  expect(view_and_print_live_pins_page).to_not have_pupil_list unless view_and_print_live_pins_page.has_pupil_list?

end

And(/^I should not see the pupil on the select pupils for restarts list$/) do
  restarts_page.load
  restarts_page.select_pupil_to_restart_btn.click
  if restarts_page.has_pupil_list?
    expect(restarts_page.pupil_list.rows.find {|pupil| pupil.text.include? @details_hash[:first_name]}).to be_nil
  else
    expect(restarts_page).to have_no_pupils
  end
end

Given(/^I have more than (\d+) pupils eligible for a restart$/) do |number_of_restarts|
  @number_of_restarts = number_of_restarts + 1
  step 'I am logged in'
  step 'I am on the add multiple pupil page'
  @upns_for_school = add_multiple_pupil_page.upload_pupils(@number_of_restarts, @school_name)
  navigate_to_pupil_list_for_pin_gen('live')
  generate_live_pins_overview_page.select_all_pupils.click
  expect(generate_live_pins_overview_page.sticky_banner.selected_count.text.to_i).to be >= @number_of_restarts
  generate_live_pins_overview_page.sticky_banner.confirm.click
  expect(current_url).to include '/view-and-custom-print-live-pins'
  @upns_for_school.each do |upn|
    pupil_detail = SqlDbHelper.pupil_details_using_school(upn,@school_id)
    pupil_id = pupil_detail['id']
    check_entry = SqlDbHelper.check_details(pupil_id)
    pupil_pin_detail = SqlDbHelper.get_pupil_pin(check_entry['id'])
    pupil_pin = pupil_pin_detail['val']
    school_password = SqlDbHelper.find_school(pupil_detail['school_id'])['pin']
    Timeout.timeout(ENV['WAIT_TIME'].to_i) {sleep 1 until RequestHelper.auth(school_password, pupil_pin).code == 200}
    response_pupil_auth = RequestHelper.auth(school_password, pupil_pin)
    @parsed_response_pupil_auth = JSON.parse(response_pupil_auth.body)
    @check_code = check_entry['checkCode']
    FunctionsHelper.complete_check_via_check_code([@check_code])
    SqlDbHelper.wait_for_received_check(@check_code)
  end
end

Then(/^I can select all$/) do
  restarts_page.load
  restarts_page.select_pupil_to_restart_btn.click
  pupil_names = @upns_for_school.map {|upn| SqlDbHelper.pupil_details(upn, @school_id)['foreName']}
  Timeout.timeout(30) {visit current_url until restarts_page.pupil_list.rows.find {|pupil| pupil.text.include? pupil_names.first}}
  @before_submission = SqlDbHelper.count_all_restarts
  restarts_page.restarts_for_multiple_pupils_using_names(pupil_names)
end

And(/^I should see the pupils have a restart$/) do
  after_submission = SqlDbHelper.count_all_restarts
  expect(@before_submission + @number_of_restarts).to eql after_submission
end


Then(/^I should not be able to remove the restart$/) do
  pupil_row = restarts_page.restarts_pupil_list.rows.find {|row| row.name.text.eql?("#{@details_hash[:last_name]}, #{@details_hash[:first_name]}")}
  expect(pupil_row).to have_no_remove_restart
end
