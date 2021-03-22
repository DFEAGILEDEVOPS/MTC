Given(/^I am on the search organisations page$/) do
  step 'I have signed in with service-manager'
  admin_page.school_search.click
  manage_organisations_page.search.click
end

When(/^I search for a valid DFE number$/) do
  search_organisations_page.input.set @school['entity']['dfeNumber']
  search_organisations_page.search.click
end

Then(/^I should see results relating to that school$/) do
  expect(school_search_results_page.heading.text).to eql @school_name
  expect(school_search_results_page.dfe_number.text).to eql @school['entity']['dfeNumber'].to_s
  expect(school_search_results_page.urn.text).to eql @school['entity']['urn'].to_s
  expect(school_search_results_page.lea_code.text).to eql @school['entity']['leaCode'].to_s
  expect(school_search_results_page.estab.text).to eql @school['entity']['estabCode'].to_s
  expect(school_search_results_page.number_of_pupils.text).to eql SqlDbHelper.list_of_pupils_from_school(@school_id).size.to_s
end

When(/^I search for a valid URN$/) do
  search_organisations_page.input.set @school['entity']['urn']
  search_organisations_page.search.click
end

When(/^I search for a invalid DFE number$/) do
  search_organisations_page.input.set(@school['entity']['dfeNumber']+1)
  search_organisations_page.search.click
end

Then(/^I should see an error stating the school does not exist$/) do
  expect(search_organisations_page).to have_school_not_found
end

When(/^I search for a invalid URN$/) do
  search_organisations_page.input.set(@school['entity']['urn']+1)
  search_organisations_page.search.click
end

When(/^I decide to cancel the search$/) do
  search_organisations_page.cancel.click
end

Then(/^I am taken back to the manage organisations page$/) do
  expect(manage_organisations_page).to be_displayed
end
