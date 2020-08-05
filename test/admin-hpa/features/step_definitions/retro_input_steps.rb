Given("I have completed the check") do
  step 'I have generated a live pin for a pupil'
  step 'pupil logs in and completed the check'
end

When(/^I add an input assistant after taking the check$/) do
  access_arrangements_page.load
  access_arrangements_page.select_pupil_and_arrangement_btn.click
  select_access_arrangements_page.retro_input.link.click
  Timeout.timeout(ENV['WAIT_TIME'].to_i) {(visit current_url; retro_input_page.search_pupil.set(@details_hash[:first_name])) until
    retro_input_page.auto_search_list[0].text.include? @details_hash[:first_name]}
  retro_input_page.search_pupil.set(@details_hash[:first_name])
  retro_input_page.auto_search_list[0].click
  retro_input_page.enter_input_assistant_details
  retro_input_page.save.click
  expect(access_arrangements_page).to be_displayed
  hightlighted_row = access_arrangements_page.pupil_list.rows.find {|row| row.has_highlighted_pupil?}
  expect(hightlighted_row.text).to include("#{@details_hash[:last_name]}, #{@details_hash[:first_name]}")
  expect(hightlighted_row.text).to include('Retrospective Input assistance')
end

Then(/^the input assistant should be stored$/) do
  db_record = SqlDbHelper.get_access_arrangements_for_a_pupil(@pupil_id)
  expect(db_record.first['retroInputAssistantFirstName']).to eql 'Input'
  expect(db_record.first['retroInputAssistantLastName']).to eql 'Assistant'
  expect(db_record.first['retroInputAssistantReason']).to eql 'Input Assistant Reason'
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
