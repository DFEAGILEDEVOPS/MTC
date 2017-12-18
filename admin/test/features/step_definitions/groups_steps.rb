Given(/^I am on the groups page$/) do
  step 'I am logged in'
  school_landing_page.group_pupils.click
end

Then(/^I should see a heading on the groups page$/) do
  expect(group_pupils_page).to have_heading
end

Then(/^I should see a intro$/) do
  expect(group_pupils_page).to have_intro
end

Then(/^I should see a option to create a new group$/) do
  expect(group_pupils_page).to have_create_group
end

Then(/^I should see a table of existing groups$/) do
  expect(group_pupils_page.group_list).to be_all_there
end

Then(/^I should see related content$/) do
  expect(group_pupils_page).to have_related_heading
  expect(group_pupils_page).to have_guidance
  expect(group_pupils_page).to have_pupil_register
  expect(group_pupils_page).to have_generate_pins
end