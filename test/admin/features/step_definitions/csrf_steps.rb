Then(/^I should see the add pupils form has a hidden csrf field$/) do
  expect(add_pupil_page).to have_csrf
  value = add_pupil_page.csrf.value
  visit current_url
  expect(add_pupil_page.csrf.value).to_not eql value
end

Then(/^I should see the add multiple pupils form has a hidden csrf field$/) do
  expect(add_multiple_pupil_page).to have_csrf
  value = add_multiple_pupil_page.csrf.value
  visit current_url
  expect(add_multiple_pupil_page.csrf.value).to_not eql value
end

Then(/^I should see the pupil reason form has a hidden csrf field$/) do
  expect(pupil_reason_page).to have_csrf
  value = pupil_reason_page.csrf.value
  visit current_url
  expect(pupil_reason_page.csrf.value).to_not eql value
end

Then(/^I should see the create group form has a hidden csrf field$/) do
  expect(group_pupils_page).to have_csrf
  value = group_pupils_page.csrf.value
  visit current_url
  expect(group_pupils_page.csrf.value).to_not eql value
end

Then(/^I should see the generate pins form has a hidden csrf field$/) do
  expect(generate_pins_overview_page).to have_csrf
  value = generate_pins_overview_page.csrf.value
  visit current_url
  expect(generate_pins_overview_page.csrf.value).to_not eql value
end

Then(/^I should see the restarts form has a hidden csrf field$/) do
  expect(restarts_page).to have_csrf
  value = restarts_page.csrf.value
  visit current_url
  expect(restarts_page.csrf.value).to_not eql value
end

Then(/^I should see the create a check window form has a hidden csrf field$/) do
  expect(add_edit_check_window_page).to have_csrf
  value = add_edit_check_window_page.csrf.value
  visit current_url
  expect(add_edit_check_window_page.csrf.value).to_not eql value
end

Then(/^I should see the pupil census form has a hidden csrf field$/) do
  expect(upload_pupil_census_page).to have_csrf
  value = upload_pupil_census_page.csrf.value
  visit current_url
  expect(upload_pupil_census_page.csrf.value).to_not eql value
end

Then(/^I should see the check settings form has a hidden csrf field$/) do
  expect(check_settings_page).to have_csrf
  value = check_settings_page.csrf.value
  visit current_url
  expect(check_settings_page.csrf.value).to_not eql value
end

Then(/^I should see the upload new form has a hidden csrf field$/) do
  expect(upload_and_view_forms_page).to have_csrf
  value = upload_and_view_forms_page.csrf.value
  visit current_url
  expect(upload_and_view_forms_page.csrf.value).to_not eql value
end

Then(/^I should see the assign check form has a hidden csrf field$/) do
  expect(assign_form_to_window_page).to have_csrf
  value = assign_form_to_window_page.csrf.value
  visit current_url
  expect(assign_form_to_window_page.csrf.value).to_not eql value
end

And(/^I want to assign a form$/) do
  assign_form_to_window_page.check_windows.rows.first.assign_form.click
end