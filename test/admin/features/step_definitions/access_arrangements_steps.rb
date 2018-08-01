
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