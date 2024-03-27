Given(/^I have created a school$/) do
  expect(SqlDbHelper.find_school_by_urn(@urn)).to_not be_nil
end


When(/^I view audit history of the school$/) do
  step 'I am on the search organisations page'
  step 'I search for a valid DFE number'
  step 'I should see results relating to that school'
end


Then(/^I should see an insert entry$/) do
  insert_row = school_search_results_page.audit_history.rows.find {|row| row.type.text.include? 'Insert'}
  insert_row.date.click
  tabs = page.driver.browser.window_handles
  page.driver.browser.switch_to.window(tabs.last)
  audit_entry = JSON.parse(page.text)
  db_school_record = SqlDbHelper.find_school_by_urn(@urn)
  expect(audit_entry['id']).to eql db_school_record['id']
  expect(Time.parse(audit_entry['createdAt'])).to eql db_school_record['createdAt'].utc
  expect(Time.parse(audit_entry['updatedAt'])).to eql db_school_record['updatedAt'].utc
  expect(audit_entry['leaCode']).to eql db_school_record['leaCode']
  expect(audit_entry['estabCode']).to eql db_school_record['estabCode']
  expect(audit_entry['name']).to eql db_school_record['name']
  expect(audit_entry['urlSlug']).to eql db_school_record['urlSlug']
  expect(audit_entry['urn']).to eql db_school_record['urn']
  expect(audit_entry['dfeNumber']).to eql db_school_record['dfeNumber']
  expect(audit_entry['urn']).to eql db_school_record['urn']
  expect(audit_entry['pin']).to be_nil
  expect(audit_entry['pinExpiresAt']).to be_nil
end


Given(/^I have updated the name of a school$/) do
  step "I have searched for a school"
  school_search_results_page.edit.click
  @hash = {name: 'Changed School Name'}
  edit_school_page.name.set @hash[:name]
  @toe = SqlDbHelper.type_of_establishment.sample
  edit_school_page.type_of_establishment.select @toe
  step 'I save these changes'
  @school_name = @hash[:name]
  visit ENV['ADMIN_BASE_URL'] + '/sign-out'
end


Then(/^I should see an update entry for updating the name$/) do
  update_row = school_search_results_page.audit_history.rows.find {|row| row.type.text.include? 'Update'}
  update_row.date.click
  tabs = page.driver.browser.window_handles
  page.driver.browser.switch_to.window(tabs.last)
  audit_entry = JSON.parse(page.text)
  expect(audit_entry['name']).to eql @hash[:name]
  db_school_record = SqlDbHelper.find_school_by_urn(@urn)
  expect(audit_entry['id']).to eql db_school_record['id']
  expect(Time.parse(audit_entry['createdAt'])).to eql db_school_record['createdAt'].utc
  expect(Time.parse(audit_entry['updatedAt'])).to eql db_school_record['updatedAt'].utc
  expect(audit_entry['leaCode']).to eql db_school_record['leaCode']
  expect(audit_entry['estabCode']).to eql db_school_record['estabCode']
  expect(audit_entry['name']).to eql db_school_record['name']
  expect(audit_entry['urlSlug']).to eql db_school_record['urlSlug']
  expect(audit_entry['urn']).to eql db_school_record['urn']
  expect(audit_entry['dfeNumber']).to eql db_school_record['dfeNumber']
  expect(audit_entry['urn']).to eql db_school_record['urn']
  expect(audit_entry['pin']).to be_nil
  expect(audit_entry['pinExpiresAt']).to be_nil
end


Given(/^I have generated a password for a school$/) do
  FunctionsHelper.generate_school_pin(@school_id)
end


Then(/^I should seen an update entry for generating a password$/) do
  update_row = school_search_results_page.audit_history.rows.find {|row| row.type.text.include? 'Update'}
  update_row.date.click
  tabs = page.driver.browser.window_handles
  page.driver.browser.switch_to.window(tabs.last)
  audit_entry = JSON.parse(page.text)
  db_school_record = SqlDbHelper.find_school_by_urn(@urn)
  expect(audit_entry['id']).to eql db_school_record['id']
  expect(Time.parse(audit_entry['createdAt'])).to eql db_school_record['createdAt'].utc
  expect(Time.parse(audit_entry['updatedAt'])).to eql db_school_record['updatedAt'].utc
  expect(audit_entry['leaCode']).to eql db_school_record['leaCode']
  expect(audit_entry['estabCode']).to eql db_school_record['estabCode']
  expect(audit_entry['pin']).to eql db_school_record['pin']
  expect(Time.parse(audit_entry['pinExpiresAt'])).to eql db_school_record['pinExpiresAt'].utc
  expect(audit_entry['name']).to eql db_school_record['name']
  expect(audit_entry['urlSlug']).to eql db_school_record['urlSlug']
  expect(audit_entry['urn']).to eql db_school_record['urn']
  expect(audit_entry['dfeNumber']).to eql db_school_record['dfeNumber']
  expect(audit_entry['urn']).to eql db_school_record['urn']
end


Given(/^I have updated the Dfe number for a school$/) do
  step "I have searched for a school"
  school_search_results_page.edit.click
  @hash = {name: @school_name, dfe: @school['dfeNumber'] + 1000}
  edit_school_page.dfe.set @hash[:dfe]
  @toe = SqlDbHelper.type_of_establishment.sample
  edit_school_page.type_of_establishment.select @toe
  step 'I save these changes'
  @school['dfeNumber'] = @hash[:dfe]
  visit ENV['ADMIN_BASE_URL'] + '/sign-out'
end


Then('I should seen an update entry for updating the Dfe number') do
  update_row = school_search_results_page.audit_history.rows.find {|row| row.type.text.include? 'Update'}
  update_row.date.click
  tabs = page.driver.browser.window_handles
  page.driver.browser.switch_to.window(tabs.last)
  audit_entry = JSON.parse(page.text)
  expect(audit_entry['dfeNumber']).to eql @hash[:dfe]
  db_school_record = SqlDbHelper.find_school_by_urn(@urn)
  expect(audit_entry['id']).to eql db_school_record['id']
  expect(Time.parse(audit_entry['createdAt'])).to eql db_school_record['createdAt'].utc
  expect(Time.parse(audit_entry['updatedAt'])).to eql db_school_record['updatedAt'].utc
  expect(audit_entry['leaCode']).to eql db_school_record['leaCode']
  expect(audit_entry['estabCode']).to eql db_school_record['estabCode']
  expect(audit_entry['name']).to eql db_school_record['name']
  expect(audit_entry['urlSlug']).to eql db_school_record['urlSlug']
  expect(audit_entry['urn']).to eql db_school_record['urn']
  expect(audit_entry['dfeNumber']).to eql db_school_record['dfeNumber']
  expect(audit_entry['urn']).to eql db_school_record['urn']
  expect(audit_entry['pin']).to be_nil
  expect(audit_entry['pinExpiresAt']).to be_nil
end


Given(/^I have updated the URN for a school$/) do
  step "I have searched for a school"
  school_search_results_page.edit.click
  @hash = {name: @school_name, urn: @urn + 1000}
  edit_school_page.urn.set @hash[:urn]
  @toe = SqlDbHelper.type_of_establishment.sample
  edit_school_page.type_of_establishment.select @toe
  step 'I save these changes'
  @school['urn'] = @hash[:urn]
  @urn = @hash[:urn]
  visit ENV['ADMIN_BASE_URL'] + '/sign-out'
end

Then(/^I should seen an update entry for updating the URN$/) do
  update_row = school_search_results_page.audit_history.rows.find {|row| row.type.text.include? 'Update'}
  update_row.date.click
  tabs = page.driver.browser.window_handles
  page.driver.browser.switch_to.window(tabs.last)
  audit_entry = JSON.parse(page.text)
  expect(audit_entry['urn']).to eql @hash[:urn]
  db_school_record = SqlDbHelper.find_school_by_urn(@urn)
  expect(audit_entry['id']).to eql db_school_record['id']
  expect(Time.parse(audit_entry['createdAt'])).to eql db_school_record['createdAt'].utc
  expect(Time.parse(audit_entry['updatedAt'])).to eql db_school_record['updatedAt'].utc
  expect(audit_entry['leaCode']).to eql db_school_record['leaCode']
  expect(audit_entry['estabCode']).to eql db_school_record['estabCode']
  expect(audit_entry['name']).to eql db_school_record['name']
  expect(audit_entry['urlSlug']).to eql db_school_record['urlSlug']
  expect(audit_entry['urn']).to eql db_school_record['urn']
  expect(audit_entry['dfeNumber']).to eql db_school_record['dfeNumber']
  expect(audit_entry['urn']).to eql db_school_record['urn']
  expect(audit_entry['pin']).to be_nil
  expect(audit_entry['pinExpiresAt']).to be_nil
end


Given(/^I have updated the LEA code for a school$/) do
  step "I have searched for a school"
  school_search_results_page.edit.click
  @hash = {name: @school_name, lea_code: SqlDbHelper.get_list_of_la_codes.sample.to_i}
  edit_school_page.lea_code.set @hash[:lea_code]
  @toe = SqlDbHelper.type_of_establishment.sample
  edit_school_page.type_of_establishment.select @toe
  step 'I save these changes'
  @school['leaCode'] = @hash[:lea_code]
  visit ENV['ADMIN_BASE_URL'] + '/sign-out'
end


Then(/^I should seen an update entry for updating the LEA code$/) do
  update_row = school_search_results_page.audit_history.rows.find {|row| row.type.text.include? 'Update'}
  update_row.date.click
  tabs = page.driver.browser.window_handles
  page.driver.browser.switch_to.window(tabs.last)
  audit_entry = JSON.parse(page.text)
  expect(audit_entry['leaCode']).to eql @hash[:lea_code]
  db_school_record = SqlDbHelper.find_school_by_urn(@urn)
  expect(audit_entry['id']).to eql db_school_record['id']
  expect(Time.parse(audit_entry['createdAt'])).to eql db_school_record['createdAt'].utc
  expect(Time.parse(audit_entry['updatedAt'])).to eql db_school_record['updatedAt'].utc
  expect(audit_entry['leaCode']).to eql db_school_record['leaCode']
  expect(audit_entry['estabCode']).to eql db_school_record['estabCode']
  expect(audit_entry['name']).to eql db_school_record['name']
  expect(audit_entry['urlSlug']).to eql db_school_record['urlSlug']
  expect(audit_entry['urn']).to eql db_school_record['urn']
  expect(audit_entry['dfeNumber']).to eql db_school_record['dfeNumber']
  expect(audit_entry['urn']).to eql db_school_record['urn']
  expect(audit_entry['pin']).to be_nil
  expect(audit_entry['pinExpiresAt']).to be_nil
end


Given(/^I have updated the Estab code for a school$/) do
  step "I have searched for a school"
  school_search_results_page.edit.click
  @hash = {name: @school_name, estab_code: @estab_code + 1}
  edit_school_page.estab_code.set @hash[:estab_code]
  @toe = SqlDbHelper.type_of_establishment.sample
  edit_school_page.type_of_establishment.select @toe
  step 'I save these changes'
  @school['estabCode'] = @hash[:estab_code]
  visit ENV['ADMIN_BASE_URL'] + '/sign-out'
end


Then(/^I should seen an update entry for updating the Estab code$/) do
  update_row = school_search_results_page.audit_history.rows.find {|row| row.type.text.include? 'Update'}
  update_row.date.click
  tabs = page.driver.browser.window_handles
  page.driver.browser.switch_to.window(tabs.last)
  audit_entry = JSON.parse(page.text)
  expect(audit_entry['estabCode']).to eql @hash[:estab_code]
  db_school_record = SqlDbHelper.find_school_by_urn(@urn)
  expect(audit_entry['id']).to eql db_school_record['id']
  expect(Time.parse(audit_entry['createdAt'])).to eql db_school_record['createdAt'].utc
  expect(Time.parse(audit_entry['updatedAt'])).to eql db_school_record['updatedAt'].utc
  expect(audit_entry['leaCode']).to eql db_school_record['leaCode']
  expect(audit_entry['estabCode']).to eql db_school_record['estabCode']
  expect(audit_entry['name']).to eql db_school_record['name']
  expect(audit_entry['urlSlug']).to eql db_school_record['urlSlug']
  expect(audit_entry['urn']).to eql db_school_record['urn']
  expect(audit_entry['dfeNumber']).to eql db_school_record['dfeNumber']
  expect(audit_entry['urn']).to eql db_school_record['urn']
  expect(audit_entry['pin']).to be_nil
  expect(audit_entry['pinExpiresAt']).to be_nil
end


Given(/^I have updated the type of Estab for a school$/) do
    step "I have searched for a school"
    school_search_results_page.edit.click
    @toe = SqlDbHelper.type_of_establishment.sample
    @hash = {name: @school_name}
    edit_school_page.type_of_establishment.select @toe
    step 'I save these changes'
    visit ENV['ADMIN_BASE_URL'] + '/sign-out'
end


Then(/^I should seen an update entry for updating the type of Estab$/) do
  update_row = school_search_results_page.audit_history.rows.find {|row| row.type.text.include? 'Update'}
  update_row.date.click
  tabs = page.driver.browser.window_handles
  page.driver.browser.switch_to.window(tabs.last)
  audit_entry = JSON.parse(page.text)
  db_school_record = SqlDbHelper.find_school_by_urn(@urn)
  expect(audit_entry['estabCode']).to eql db_school_record['estabCode']
  expect(audit_entry['id']).to eql db_school_record['id']
  expect(Time.parse(audit_entry['createdAt'])).to eql db_school_record['createdAt'].utc
  expect(Time.parse(audit_entry['updatedAt'])).to eql db_school_record['updatedAt'].utc
  expect(audit_entry['leaCode']).to eql db_school_record['leaCode']
  expect(audit_entry['estabCode']).to eql db_school_record['estabCode']
  expect(audit_entry['name']).to eql db_school_record['name']
  expect(audit_entry['urlSlug']).to eql db_school_record['urlSlug']
  expect(audit_entry['urn']).to eql db_school_record['urn']
  expect(audit_entry['dfeNumber']).to eql db_school_record['dfeNumber']
  expect(audit_entry['urn']).to eql db_school_record['urn']
  expect(audit_entry['pin']).to be_nil
  expect(audit_entry['pinExpiresAt']).to be_nil
  toe_row = SqlDbHelper.find_type_of_establishment(@toe.split(" (")[0])
  expect(audit_entry['typeOfEstablishmentLookup_id']).to eql toe_row['id']
end
