
Given(/^I navigate to access arrangements page$/) do
  school_landing_page.access_arrangements.click
end

Then(/^the access arrangements page is displayed as per the design$/) do
  expect(access_arrangements_page).to have_heading
  expect(access_arrangements_page).to have_information
  expect(access_arrangements_page).to have_select_pupil_and_arrangement_btn
end

Given(/^I am on the select access arrangements page$/) do
  step 'I have signed in with teacher2'
  school_landing_page.access_arrangements.click
  access_arrangements_page.select_pupil_and_arrangement_btn.click
end

Then(/^I should see the select access arrangements page matches design$/) do
  expected_list = SqlDbHelper.access_arrangements.map{|a| a['description']}
  actual_list = select_access_arrangements_page.access_arrangements.row.map {|a| a.arrangement_name.text}
  expect(actual_list).to eql expected_list
  expect(select_access_arrangements_page).to have_drop_down
  expect(select_access_arrangements_page).to have_save
  expect(select_access_arrangements_page).to have_cancel
  expect(select_access_arrangements_page).to have_back_to_top
end

When(/^I search for pupil '(.*)'$/) do |pupil_search|
  select_access_arrangements_page.search_pupil.set(pupil_search)
end

Then(/^I can see auto search list$/) do
  expect(select_access_arrangements_page.auto_search_list.count < 0).to be_truthy, "Actual count of the auto serach suggestion is #{select_access_arrangements_page.auto_search_list.count}"
end

Then(/^I can see the pupil returned in auto search list$/) do
  actual_pupil_returned =select_access_arrangements_page.auto_search_list[0].text
  expect(actual_pupil_returned.include?(@details_hash[:first_name])). to be_truthy, "Search result Expected: #{@details_hash[:first_name]}...But actual : #{actual_pupil_returned} "
end

Given(/^I search for the pupil for access arrangement$/) do
  name = (0...8).map {(65 + rand(26)).chr}.join
  step "I am logged in"
  step "I am on the add pupil page"
  step "I submit the form with the name fields set as #{name}"
  access_arrangements_page.load
  access_arrangements_page.select_pupil_and_arrangement_btn.click

  step "I search for pupil '#{@details_hash[:first_name]}'"
end