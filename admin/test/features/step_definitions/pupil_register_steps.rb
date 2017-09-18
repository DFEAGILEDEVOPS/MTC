Given(/^I am on the Pupil Register page$/) do
  pupil_register_page.load
end

Then(/^I should see on Pupil register page that all the pupils who are registered are displayed and sorted by lastname$/) do
  pupils_from_page = pupil_register_page.pupil_list.pupil_row.map {|x| x.names.text}
  sorted_pupils_from_page = pupil_register_page.pupil_list.pupil_row.map {|x| x.names.text}.sort
  expect(sorted_pupils_from_page).to match_array(pupils_from_page)
end

Then(/^I should see on the Pupil Register page that all pupils are displayed in descending order of lastname$/) do
  pupils_from_page = pupil_register_page.pupil_list.pupil_row.map {|x| x.names.text}
  sorted_pupils_from_page = pupil_register_page.pupil_list.pupil_row.map {|x| x.names.text}.sort.reverse
  expect(sorted_pupils_from_page).to match_array(pupils_from_page)
end

When(/^I click the Add Pupils link from Pupil Register page$/) do
  pupil_register_page.add_pupil.click
end

When(/^I click on the Name heading$/) do
  pupil_register_page.pupil_list_column_heading.name_heading.click
end