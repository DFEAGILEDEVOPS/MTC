Given(/^I have uploaded a check form$/) do
  step "I am on the manage check forms page"
  step "I upload a csv file"
end

When(/^I have assigned the check form to a check window$/) do
  manage_check_forms_page.available_checks.rows.first.checkbox.click
  manage_check_forms_page.assign.click
  @window_name = choose_check_window_page.assign_to_check_window.rows.first.title.text
  choose_check_window_page.assign_to_check_window.rows.first.checkbox.click
  choose_check_window_page.continue.click
end

Then(/^the check form should be displayed as being assigned to the check window$/) do
  expect(manage_check_forms_page.available_checks.rows.first.assigned_to.text).to include @window_name
end

Given(/^I previously assigned a check form to a check window$/) do
  step "I have uploaded a check form"
  step "I have assigned the check form to a check window"
  @first_window_name = @window_name
end

When(/^I have assigned the check form to another check window$/) do
  manage_check_forms_page.available_checks.rows.first.checkbox.click
  manage_check_forms_page.assign.click
  @last_window_name = choose_check_window_page.assign_to_check_window.rows.last.title.text
  choose_check_window_page.assign_to_check_window.rows.last.checkbox.click
  choose_check_window_page.continue.click
end

Then(/^the check form should be displayed as being assigned to multiple check window$/) do
  wait_until{(manage_check_forms_page.available_checks.rows.first.assigned_to.text).eql? @first_window_name + ', ' + @last_window_name}
end

When(/^I choose to preview the check form questions$/) do
  manage_check_forms_page.available_checks.rows.first.title.click
end

Then(/^I should see the questions exactly as intended$/) do
  expect(view_form_page).to be_displayed
  expect(view_form_page.question_and_answers_on_page).to eql view_form_page.question_and_answers_from_csv(File.expand_path('../data/fixtures/check-form-1.csv'))
end

Given(/^I am on the assign check window page$/) do
  step "I am on the manage check forms page"
  step "I upload a csv file"
  manage_check_forms_page.available_checks.rows.first.checkbox.click
  manage_check_forms_page.assign.click
end

Then(/^I should see a heading for the page$/) do
  expect(choose_check_window_page).to have_heading
end

Then(/^I should see some information about the check form$/) do
  expect(choose_check_window_page).to have_information
end

Then(/^I should see some instructions$/) do
  expect(choose_check_window_page).to have_page_instructions
end

Then(/^I should see an option to continue$/) do
  expect(choose_check_window_page).to have_continue
end

Then(/^I should see an option to go back$/) do
  expect(choose_check_window_page).to have_back
end

Then(/^I should see check windows$/) do
  expect(choose_check_window_page.assign_to_check_window.rows).to_not be_empty
end

Then(/^check windows should have a title$/) do
  choose_check_window_page.assign_to_check_window.rows.each{|row| expect(row.title.text).to_not be_empty}
end

Then(/^check windows should have a checkbox$/) do
  choose_check_window_page.assign_to_check_window.rows.each{|row| expect(row).to have_checkbox}
end

Then(/^check windows should have a start date$/) do
  choose_check_window_page.assign_to_check_window.rows.each{|row| expect(row.start_date.text).to_not be_empty}
end

Then(/^check windows should have a end date$/) do
  choose_check_window_page.assign_to_check_window.rows.each{|row| expect(row.end_date.text).to_not be_empty}
end

Then(/^I should be given the option to delete the form$/) do
  expect(view_form_page).to have_delete_form
end

Then(/^I should be given the option to go back to the manage check form page$/) do
  expect(view_form_page).to have_back_to_manage_forms
end

Given(/^I am viewing a check form that is unassigned to a check window$/) do
  step "I have uploaded a check form"
  step "I choose to preview the check form questions"
end

When(/^I choose to go back$/) do
  view_form_page.back_to_manage_forms.click
end

Then(/^I am taken to the manage check forms page$/) do
  expect(manage_check_forms_page).to be_displayed
end

When(/^I choose to delete it$/) do
  @form_title = view_form_page.heading.text
  view_form_page.delete_form.click
end

Then(/^it should be removed from the list of available checks$/) do
  available_checks = manage_check_forms_page.available_checks.rows.map{|check| check.title.text}
  expect(available_checks).to_not include @form_title
end

Given(/^I am viewing a check form that is assigned to a check window$/) do
  step "I have uploaded a check form"
  step "I have assigned the check form to a check window"
  step "I choose to preview the check form questions"
end

Then(/^I should not be able to delete it$/) do
  expect(view_form_page).to have_no_delete_form
end