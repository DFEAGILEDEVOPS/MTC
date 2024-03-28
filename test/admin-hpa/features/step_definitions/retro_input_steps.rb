Given("I have completed the check") do
  step 'I have generated a live pin for a pupil'
  step 'pupil logs in and completed the check'
end

When(/^I add an input assistant after taking the check$/) do
  access_arrangements_page.load
  access_arrangements_page.retro_input.link.click
  Timeout.timeout(ENV['WAIT_TIME'].to_i) {(visit current_url; retro_input_page.search_pupil.set(@details_hash[:first_name])) until retro_input_page.auto_search_list[0].text.include? @details_hash[:first_name]}
  retro_input_page.search_pupil.set(@details_hash[:first_name])
  retro_input_page.auto_search_list[0].click
  retro_input_page.enter_input_assistant_details
  retro_input_page.save.click
  expect(access_arrangements_page).to be_displayed
  hightlighted_row = access_arrangements_page.pupil_list.rows.find {|row| row.has_highlighted_pupil?}
  expect(hightlighted_row.text).to include("#{@details_hash[:last_name]}, #{@details_hash[:first_name]}")
  expect(hightlighted_row.text).to include('Input assistance')
end

Then(/^the input assistant should be stored$/) do
  db_record = SqlDbHelper.get_access_arrangements_for_a_pupil(@pupil_id)
  expect(db_record.first['retroInputAssistantFirstName']).to eql 'Input'
  expect(db_record.first['retroInputAssistantLastName']).to eql 'Assistant'
  check_id = SqlDbHelper.check_details(@pupil_id)['id']
  expect(db_record.first['retroInputAssistant_check_id']).to eql check_id
end

When(/^I am on the retro input page$/) do
  retro_input_page.load
end

Then("searching for the pupil with an active restart does not return any results") do
  retro_input_page.search_pupil.set(@details_hash[:first_name])
  expect(retro_input_page.auto_search_list[0].text).to eql 'No results found'
end

Then(/^I should be able to add input assistant against the second check$/) do
  expect(step 'I add an input assistant after taking the check').to be_truthy
  step 'the input assistant should be stored'
end

Then(/^I should be able to add input assistant against the third check$/) do
  expect(step 'I add an input assistant after taking the check').to be_truthy
  step 'the input assistant should be stored'
end

Then(/^I should not be able to add retro input assistance to any pupils$/) do
  step 'I submit the form with the hdf name fields set as Test'
  declaration_review_pupils_page.continue_button.click
  step 'I submit the form with confirmation'
  access_arrangements_page.load
  expect(access_arrangements_page).to have_no_retro_input
end

Given(/^I have signed the hdf$/) do
  step 'I am logged in'
  step 'I have some pupils that have completed the check'
  step 'the live check window closes'
  step 'I set the remaining pupils as not taking the check'
  step 'I should be able to submit the HDF'
end

Given(/^the check window is now closed$/) do
  step 'I am logged in'
  step 'I have some pupils that have completed the check'
  step 'the live check window closes'
end

Then(/^I should be able to add an input assistant retrospectively$/) do
  visit ENV['ADMIN_BASE_URL'] + '/sign-out'
  step "I am logged in"
  school_landing_page.access_arrangements.click
  access_arrangements_page.retro_input.link.click
  Timeout.timeout(ENV['WAIT_TIME'].to_i) {(visit current_url; retro_input_page.search_pupil.set(@pupil_names_arr.first.split(',')[0])) until retro_input_page.auto_search_list[0].text.include? @pupil_names_arr.first.split(',')[0]}
  retro_input_page.search_pupil.set(@pupil_names_arr.first.split(',')[0])
  retro_input_page.auto_search_list[0].click
  retro_input_page.enter_input_assistant_details
  retro_input_page.save.click
  expect(access_arrangements_page).to be_displayed
  hightlighted_row = access_arrangements_page.pupil_list.rows.find {|row| row.has_highlighted_pupil?}
  expect(hightlighted_row.text).to include("#{@pupil_names_arr.first}")
  expect(hightlighted_row.text).to include('Input assistance')
end

And(/^the access arrangement pupil list should be read only$/) do
  access_arrangements_page.pupil_list.rows.each {|row| expect(row).to have_no_pupil_name}
  access_arrangements_page.pupil_list.rows.each {|row| expect(row).to have_no_edit}
  wait_until(60, 1) {visit current_url; access_arrangements_page.has_diasbled_select_pupil_and_arrangement_btn?}
  expect(access_arrangements_page).to have_diasbled_select_pupil_and_arrangement_btn
end

When(/^I add an input assistant details which are over 128 chars for first name and last name$/) do
  access_arrangements_page.load
  access_arrangements_page.retro_input.link.click
  Timeout.timeout(ENV['WAIT_TIME'].to_i) {(visit current_url; retro_input_page.search_pupil.set(@details_hash[:first_name])) until retro_input_page.auto_search_list[0].text.include? @details_hash[:first_name]}
  retro_input_page.search_pupil.set(@details_hash[:first_name])
  retro_input_page.auto_search_list[0].click
  retro_input_page.first_name.set 'I' * 129
  retro_input_page.last_name.set 'A' * 129
  retro_input_page.reason.set 'Reason'
  retro_input_page.save.click
end

Then("I should see validation errors relating to the first name and last name fields") do
  expect(retro_input_page.has_css?("#input-assistant-reason[maxlength='1000']")).to be_truthy
  expect(retro_input_page.error_summary.map {|error| error.text}).to include 'Enter a first name in no more than 128 characters'
  expect(retro_input_page.error_summary.map {|error| error.text}).to include 'Enter a last name in no more than 128 characters'
end

When(/^I add an input assistant details which include special chars for first name and last name$/) do
  access_arrangements_page.load
  access_arrangements_page.retro_input.link.click
  Timeout.timeout(ENV['WAIT_TIME'].to_i) {(visit current_url; retro_input_page.search_pupil.set(@details_hash[:first_name])) until retro_input_page.auto_search_list[0].text.include? @details_hash[:first_name]}
  retro_input_page.search_pupil.set(@details_hash[:first_name])
  retro_input_page.auto_search_list[0].click
  retro_input_page.first_name.set 'Sp£cial!@£$%^&*()_+-=[];\/.,`'
  retro_input_page.last_name.set 'Sp£cial!@£$%^&*()_+-=[];\/.,`'
  retro_input_page.reason.set 'Reason'
  retro_input_page.save.click
end

Then(/^I should see validation errors relating to special chars in the first name and last name fields$/) do
  expect(retro_input_page.has_css?("#input-assistant-reason[maxlength='1000']")).to be_truthy
  expect(retro_input_page.error_summary.map {|error| error.text}).to include 'Enter a first name without any special characters'
  expect(retro_input_page.error_summary.map {|error| error.text}).to include 'Enter a last name without any special characters'
end


Given(/^I am on the retro input assitance page$/) do
  step 'I am logged in'
  retro_input_page.load
end

When(/^I submit the form with no values$/) do
  retro_input_page.save.click
end

Then(/^I should see some errors$/) do
  expect(retro_input_page.error_summary.map {|error| error.text}).to include 'Enter a first name in no more than 128 characters'
  expect(retro_input_page.error_summary.map {|error| error.text}).to include 'Enter a last name in no more than 128 characters'
  expect(retro_input_page.error_summary.map {|error| error.text}).to include 'Enter an explanation for input assistance'
  expect(retro_input_page.error_summary.map {|error| error.text}).to include 'Enter a pupil name'
end


Then(/^I should be able to remove the retro input assistant$/) do
  expect(access_arrangements_page.find_pupil_row(@details_hash[:first_name])).to have_remove_retro_input
  access_arrangements_page.find_pupil_row(@details_hash[:first_name]).remove_retro_input.click
  access_arrangements_page.modal.confirm.click
  db_record = SqlDbHelper.get_access_arrangements_for_a_pupil(@pupil_id)
  expect(db_record).to be_empty
end

Given(/^I have added an input assistant retrospectively$/) do
  step 'I have completed the check'
  step 'I add an input assistant after taking the check'
  step 'the input assistant should be stored'
end
