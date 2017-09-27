Given(/^I am on the pupil not taking check page$/) do
  step 'I am logged in'
  pupils_not_taking_check_page.load
end

Then(/^I should see the heading$/) do
  expect(pupils_not_taking_check_page).to have_heading
end

Then(/^I should see the info text$/) do
  expect(pupils_not_taking_check_page).to have_info_text
end

Then(/^I should see a way to add a reason$/) do
  expect(pupils_not_taking_check_page).to have_add_reason
end

Then(/^I should be able to go back to the top$/) do
  expect(pupils_not_taking_check_page).to have_back_to_top
end

Then(/^I should see a way to generate pins$/) do
  expect(pupils_not_taking_check_page).to have_generate_pins
end

When(/^I want to add a reason$/) do
  pupils_not_taking_check_page.add_reason.click
end

Then(/^I should see a heading on the page$/) do
  expect(pupil_reason_page).to have_heading
end

Then(/^I should see set of reasons I can choose$/) do
  expected_reason_hash = MongoDbHelper.get_attendance_codes
  actual_reason_hash = {}
  pupil_reason_page.attendance_codes.each{|c| actual_reason_hash.merge!(c['value'].to_i => find("label[for=#{c['id']}]").text)}
  expect(actual_reason_hash).to eql expected_reason_hash
end

Then(/^I should see a back to top option$/) do
  expect(pupil_reason_page).to have_back_to_top
end

Then(/^I should see a option to generate pins$/) do
  expect(pupil_reason_page).to have_generate_pins
end

Then(/^I should see a section that explains the reasons$/) do
  expect(pupils_not_taking_check_page.explanation_section).to be_all_there
end

When(/^I want to add a reason for pupils not taking a check$/) do
  pupils_not_taking_check_page.load
  pupils_not_taking_check_page.add_reason.click
end

Then(/^I should see a list of pupils sorted by surname$/) do
  school_id = MongoDbHelper.find_teacher(@teacher).first['school']
  pupils_from_db = MongoDbHelper.list_of_pupils_from_school(school_id)
  expect(pupils_from_db.map{|pupil| pupil['lastName'] + ', ' + pupil['foreName'] }.sort).to eql pupil_reason_page.pupil_list.rows.map {|t| t.name.text}
end

Given(/^I am on the pupil reason page$/) do
  step 'I am on the pupil not taking check page'
  step 'I want to add a reason'
end

Then(/^I should be able to select them via a checkbox$/) do
  pupil_reason_page.pupil_list.rows.each {|pupil| expect(pupil).to have_checkbox}
end

Then(/^I should be able to sort them via their reason for absence$/) do
  fail 'not yet implemented'
end

Then(/^I should have a option to select all pupils$/) do
  expect(pupil_reason_page).to have_select_all_pupils
end


And(/^I want to sort the surnames in to desecending order$/) do
  pupil_reason_page.pupil_coloumn.click
end

Then(/^I should see a list of pupils sorted by surname in descending order$/) do
  school_id = MongoDbHelper.find_teacher(@teacher).first['school']
  pupils_from_db = MongoDbHelper.list_of_pupils_from_school(school_id)
  expect(pupils_from_db.map{|pupil| pupil['lastName'] + ', ' + pupil['foreName'] }.sort.reverse).to eql pupil_reason_page.pupil_list.rows.map {|t| t.name.text}
end