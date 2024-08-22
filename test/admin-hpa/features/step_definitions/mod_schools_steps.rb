When(/^I navigate to the settings for MOD schools page$/) do
  admin_page.mod_schools_settings.click
end

Then(/^i should see that the MOD schools page matches design$/) do
  expect(mod_schools_page).to have_heading
  expect(mod_schools_page).to have_info_text
  expect(mod_schools_page).to have_update_to_mod_school_button
  expect(mod_schools_page).to have_save
  expect(mod_schools_page).to have_cancel
end

Given(/^I am on the MOD schools page$/) do
  step 'I have signed in with service-manager'
  step 'I navigate to the settings for MOD schools page'
end

When(/^I update a school to be of a different time zone$/) do
  mod_schools_page.update_to_mod_school_button.click
  @school = SqlDbHelper.find_school(rand(1..SqlDbHelper.count_schools))
  update_school_page.urn.set @school["urn"]
  update_school_page.urn_auto_complete[0].click
  update_school_page.country.set 'Germany'
  update_school_page.country_auto_complete[0].click
  @timezone_set = update_school_page.country.value
  sleep 2
  update_school_page.save.click
  sleep 2
end

Then(/^the MOD schools page should reflect this$/) do
  expect(mod_schools_page.flash_message.text).to eql ("'#{@school['name']}' added as an MOD school")
  school = mod_schools_page.find_school_row(@school)
  expect(school).to have_highlighted
  expect(school.country.value).to eql @timezone_set
  expect(school).to have_remove_school
end


When(/^I update a invalid school and urn$/) do
  mod_schools_page.update_to_mod_school_button.click
  update_school_page.school_name.set 'Invalid school'
  update_school_page.school_name_auto_complete[0].click
  update_school_page.urn.set '000000'
  update_school_page.urn_auto_complete[0].click
  update_school_page.save.click
end


Then(/^I should see an error stating URN and school should be from the data set$/) do
  expect(update_school_page.error_summary.map {|error| error.text}).to eql ["Enter a school from the data set", "Enter a URN within the data set"]
  expect(update_school_page.error_message.map {|error| error.text}).to eql ["Enter a school from the data set", "Enter a URN within the data set"]
end


Then(/^I should see a list of schools with the LEA code of (\d+)$/) do |code|
  db_mod_schools = SqlDbHelper.get_mod_schools.map {|school| school['name'] + "\nURN: " + school['urn'].to_s}
  expect(mod_schools_page.school_list.rows.map {|row| row.school_name.text}.sort).to eql db_mod_schools.sort unless db_mod_schools.empty?
end


Given(/^I have updated a mod school to be of a different timezone$/) do
  step 'I am on the MOD schools page'
  step 'I update a school to be of a different time zone'
end

When(/^I decide to update it from the mod schools page$/) do
  school = mod_schools_page.find_school_row(@school)
  school.country.set 'Austria'
  school.country_auto_complete.click
  mod_schools_page.save.click
end

Then(/^the change should be reflected$/) do
  visit current_url
  school = mod_schools_page.find_school_row(@school)
  expect(@timezone_set).to_not eql school.country.value
end
