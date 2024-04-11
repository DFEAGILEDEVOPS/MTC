Given(/^I am on the search organisations page$/) do
  step 'I have signed in with service-manager'
  admin_page.school_search.click
  manage_organisations_page.search.click
end

When(/^I search for a valid DFE number$/) do
  search_organisations_page.input.set @school['dfeNumber']
  search_organisations_page.search.click
end

Then(/^I should see results relating to that school$/) do
  expect(school_search_results_page.heading.text).to eql @school_name
  expect(school_search_results_page.dfe_number.text).to eql @school['dfeNumber'].to_s
  expect(school_search_results_page.urn.text).to eql @school['urn'].to_s
  expect(school_search_results_page.lea_code.text).to eql @school['leaCode'].to_s
  expect(school_search_results_page.estab.text).to eql @school['estabCode'].to_s
  expect(school_search_results_page.type_of_estab_code.text).to eql @toe.nil? ? 'null' : SqlDbHelper.find_type_of_establishment(@toe.split(" (")[0])['code'].to_s
  expect(school_search_results_page.type_of_estab_name.text).to eql @toe.nil? ? 'null' : SqlDbHelper.find_type_of_establishment(@toe.split(" (")[0])['name']
  expect(school_search_results_page.number_of_pupils.text).to eql SqlDbHelper.list_of_pupils_from_school(@school_id).size.to_s
end

When(/^I search for a valid URN$/) do
  search_organisations_page.input.set @school['urn']
  search_organisations_page.search.click
end

When(/^I search for a invalid DFE number$/) do
  search_organisations_page.input.set(@school['dfeNumber'].to_s + '0')
  search_organisations_page.search.click
end

Then(/^I should see an error stating the school does not exist$/) do
  expect(search_organisations_page).to have_school_not_found
end

When(/^I search for a invalid URN$/) do
  search_organisations_page.input.set(@school['urn'].to_s + '1')
  search_organisations_page.search.click
end

When(/^I decide to cancel the search$/) do
  search_organisations_page.cancel.click
end

Then(/^I am taken back to the manage organisations page$/) do
  expect(manage_organisations_page).to be_displayed
end
