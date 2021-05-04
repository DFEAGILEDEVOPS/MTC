Given(/^I have searched for a school$/) do
  step "I am on the search organisations page"
  step "I search for a valid URN"
end


When(/^I change all the details of the school$/) do
  @before = SqlDbHelper.find_school(@school_id)
  school_search_results_page.edit.click
  @hash = {name: 'Changed School Name', dfe: (@school['entity']['dfeNumber'] + 1000), urn: @urn + 1000, lea_code: SqlDbHelper.get_list_of_la_codes.sample, estab_code: @estab_code}
  edit_school_page.edit_details(@hash)
end

When('I save these changes') do
  edit_school_page.update.click
  expect(school_search_results_page.heading.text).to eql @hash[:name]
end

Then('these changes are reflected in the DB') do
  @after = SqlDbHelper.find_school(@school_id)
  expect(@after['name']).to eql school_search_results_page.heading.text
  expect(@after['leaCode'].to_i).to eql school_search_results_page.lea_code.text.to_i
  expect(@after['estabCode']).to eql school_search_results_page.estab.text.to_i
  expect(@after['dfeNumber']).to eql school_search_results_page.dfe_number.text.to_i
  expect(@after['urn']).to eql school_search_results_page.urn.text.to_i
  expect(@after).to_not eql @before
end


And(/^I discard the changes$/) do
  edit_school_page.discard.click
  expect(school_search_results_page.heading.text).to eql @school_name
end

Then(/^these changes are not reflected in the DB$/) do
  @after = SqlDbHelper.find_school(@school_id)
  expect(@after['name']).to eql school_search_results_page.heading.text
  expect(@after['leaCode'].to_i).to eql school_search_results_page.lea_code.text.to_i
  expect(@after['estabCode']).to eql school_search_results_page.estab.text.to_i
  expect(@after['dfeNumber']).to eql school_search_results_page.dfe_number.text.to_i
  expect(@after['urn']).to eql school_search_results_page.urn.text.to_i
end
