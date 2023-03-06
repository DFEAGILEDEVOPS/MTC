Given(/^I am on the add school page$/) do
  step 'I have signed in with service-manager'
  admin_page.school_search.click
  manage_organisations_page.add_school.click

end

When(/^I submit an empty form$/) do
  add_school_page.add_school.click
end

Then(/^I should see errors stating that the fields are mandatory$/) do
  expect(add_school_page.error_summary.error_messages.map {|a| a.text}.sort).to eql ["Please choose one of the establishment types", "Please enter a DFE number", "Please enter a URN", "School name is too short", "Unknown LEA code: NaN"]
  expect(add_school_page.error_messages.map {|a| a.text}.sort).to eql ["Please choose one of the establishment types", "Please enter a DFE number", "Please enter a URN", "School name is too short"]
end

When(/^I submit valid values for a new school$/) do
  add_school_page.school_name.set 'New school ' + rand(934753).to_s
  add_school_page.dfe_number.set SqlDbHelper.get_list_of_la_codes[30] + rand.to_s[2..5]
  @urn = rand.to_s[2..5]
  add_school_page.urn.set @urn
  @toe = SqlDbHelper.type_of_establishment.sample
  add_school_page.type_of_establishment.select @toe
  add_school_page.add_school.click
end

Then(/^the new school should be added$/) do
  expect(manage_organisations_page).to have_school_added
  expect(SqlDbHelper.find_school_by_urn(@urn)).to_not be_nil
  toe_row = SqlDbHelper.find_type_of_establishment(@toe.split(" (")[0])
  expect(SqlDbHelper.find_school_by_urn(@urn)['typeOfEstablishmentLookup_id']).to eql toe_row['id']
end

When(/^I submit a duplicate value for dfe number$/) do
  school = SqlDbHelper.get_schools_list[5]
  @name = 'New school ' + rand(934753).to_s
  add_school_page.school_name.set @name
  add_school_page.dfe_number.set school['dfeNumber']
  @toe = SqlDbHelper.type_of_establishment.sample
  add_school_page.type_of_establishment.select @toe
  add_school_page.urn.set rand.to_s[2..5]
  add_school_page.add_school.click
end

Then(/^I should see an error stating the value for dfe number is a duplicate$/) do
  expect(page.text).to include "An error occurred"
  expect(SqlDbHelper.find_school_by_name(@name)).to be_nil
end

When(/^I enter details of a school which has a invalid LEA code$/) do
  add_school_page.school_name.set 'New school ' + rand(934753).to_s
  add_school_page.dfe_number.set '100' + rand.to_s[2..5]
  @urn = rand.to_s[2..5]
  add_school_page.urn.set @urn
  @toe = SqlDbHelper.type_of_establishment.sample
  add_school_page.type_of_establishment.select @toe
  add_school_page.add_school.click
end

Then(/^I should see an error stating the LA code is incorrect$/) do
  expect(add_school_page.error_summary.error_messages.map {|a| a.text}.sort).to eql ["Unknown LEA code: 100"]
end

When(/^I submit a duplicate value for urn number$/) do
  school = SqlDbHelper.get_schools_list[5]
  @name = 'New school ' + rand(934753).to_s
  add_school_page.school_name.set @name
  add_school_page.dfe_number.set SqlDbHelper.get_list_of_la_codes[30] + rand.to_s[2..5]
  add_school_page.urn.set school['urn']
  @toe = SqlDbHelper.type_of_establishment.sample
  add_school_page.type_of_establishment.select @toe
  add_school_page.add_school.click
end

Then(/^I should see an error stating the value for urn number is a duplicate$/) do
  expect(page.text).to include "An error occurred"
  expect(SqlDbHelper.find_school_by_name(@name)).to be_nil
end

When(/^I enter a Dfe number that is (\d+) digits exactly$/) do |digits|
  add_school_page.school_name.set 'New school ' + rand(934753).to_s
  add_school_page.dfe_number.set SqlDbHelper.get_list_of_la_codes[30] + rand.to_s[2..(digits.to_i - 2)]
  @urn = rand.to_s[2..5]
  add_school_page.urn.set @urn
  add_school_page.add_school.click
end

Then(/^I should see an error stating dfe number must be (\d+) digits$/) do |arg|
  expect(add_school_page.error_summary.error_messages.map {|a| a.text}.sort).to eql ["The dfeNumber must be 7 digits"]
  expect(add_school_page.error_messages.map {|a| a.text}.sort).to eql ["The dfeNumber must be 7 digits"]
end


When(/^I submit valid values for a new school with a new toe code$/) do
  add_school_page.school_name.set 'New school ' + rand(934753).to_s
  add_school_page.dfe_number.set SqlDbHelper.get_list_of_la_codes[30] + rand.to_s[2..5]
  @urn = rand.to_s[2..5]
  add_school_page.urn.set @urn
  @toe = SqlDbHelper.type_of_establishment.sample
  add_school_page.type_of_establishment.select @toe
  add_school_page.add_school.click
end


Given(/^I have added a test school$/) do
  step 'I am on the add school page'
  add_school_page.school_name.set 'New school ' + rand(934753).to_s
  add_school_page.dfe_number.set SqlDbHelper.get_list_of_la_codes[30] + rand.to_s[2..5]
  @urn = rand.to_s[2..5]
  add_school_page.urn.set @urn
  @toe = SqlDbHelper.type_of_establishment.sample
  add_school_page.type_of_establishment.select @toe
  add_school_page.is_test_school.click
  add_school_page.add_school.click
end

Then(/^the new school should be added as a test school$/) do
  step 'the new school should be added'
  expect(SqlDbHelper.find_school_by_urn(@urn)['isTestSchool']).to be_truthy
end
