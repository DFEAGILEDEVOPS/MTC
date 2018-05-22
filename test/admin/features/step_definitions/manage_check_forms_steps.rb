Given(/^I have uploaded a check form$/) do
  step "I am on the Upload and View forms page"
  step "I upload a csv file"
end

When(/^I have assigned the check form to a check window$/) do
  testdeveloper_landing_page.load
  testdeveloper_landing_page.assign_forms_to_check_windows.click
  window = assign_form_to_window_page.check_windows.rows.find{|row| row.name_of_window.text.include? @check_window_hash[:check_name]}
  window.assign_form.click
  form = assign_form_to_window_page.check_forms.rows.find {|row| row.name_of_form.text == @file_name.split('.').first}
  form.select.click
  expect(assign_form_to_window_page.sticky_banner.count.text).to eql 'Form(s) selected: 1'
  assign_form_to_window_page.sticky_banner.confirm.click
end

Then(/^the check form should be displayed as being assigned to the check window$/) do
  expect(assign_form_to_window_page.flash_message.text).to eql "1 form has been assigned to #{@check_window_hash[:check_name]}"
  window = assign_form_to_window_page.check_windows.rows.find{|row| row.name_of_window.text.include? @check_window_hash[:check_name]}
  expect(window.name_of_window.text).to eql "#{@check_window_hash[:check_name]} (1 form)"
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
  new_check = upload_and_view_forms_page.available_checks.rows.find{|row| row.has_highlighted_row?}
  new_check.title.click
end

Then(/^I should see the questions exactly as intended$/) do
  expect(view_form_page).to be_displayed
  expect(view_form_page.question_and_answers_on_page).to eql view_form_page.question_and_answers_from_csv(File.expand_path('data/fixtures/check-form-1.csv'))
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

Then(/^I am taken to the view forms page$/) do
  expect(upload_and_view_forms_page).to be_displayed
end

When(/^I choose to delete it$/) do
  @form_title = view_form_page.heading.text
  view_form_page.delete_form.click
  view_form_page.modal.confirm.click
end

Then(/^it should be removed from the list of available checks$/) do
  available_checks =  upload_and_view_forms_page.available_checks.rows.map{|check| check.title.text}
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

And(/^should show what form is assigned on the upload and view forms pge$/) do
  upload_and_view_forms_page.load
  check_row = upload_and_view_forms_page.available_checks.rows.find{|row| row.title.text == @file_name.split('.').first}
  expect(check_row.assigned_to.text).to eql @check_window_hash[:check_name]
end

When(/^I have assigned the check form to multiple check windows$/) do
  testdeveloper_landing_page.load
  testdeveloper_landing_page.assign_forms_to_check_windows.click
  window1 = assign_form_to_window_page.check_windows.rows.find{|row| row.name_of_window.text.include? @check_window_hash[:check_name]}
  @window_1_name = window1.name_of_window.text
  window1.assign_form.click
  form = assign_form_to_window_page.check_forms.rows.find {|row| row.name_of_form.text == @file_name.split('.').first}
  form.select.click
  expect(assign_form_to_window_page.sticky_banner.count.text).to eql 'Form(s) selected: 1'
  assign_form_to_window_page.sticky_banner.confirm.click
  window2 = assign_form_to_window_page.check_windows.rows.find{|row| row.name_of_window.text != @check_window_hash[:check_name]}
  @window_2_name = window2.name_of_window.text
  window2.assign_form.click
  form = assign_form_to_window_page.check_forms.rows.find {|row| row.name_of_form.text == @file_name.split('.').first}
  form.select.click
  expect(assign_form_to_window_page.sticky_banner.count.text).to eql 'Form(s) selected: 1'
  assign_form_to_window_page.sticky_banner.confirm.click
end

Then(/^the check form should be displayed as being assigned to multiple check windows$/) do
  upload_and_view_forms_page.load
  check_row = upload_and_view_forms_page.available_checks.rows.find{|row| row.title.text == @file_name.split('.').first}
  expect(check_row.assigned_to.text).to eql @window_2_name.split(' ').first + ' ' + @window_1_name.split(' ').first
end

Then(/^the check form should not be removable$/) do
  upload_and_view_forms_page.load
  check_row = upload_and_view_forms_page.available_checks.rows.find{|row| row.title.text == @file_name.split('.').first}
  expect(check_row).to have_no_remove_form
end

Then(/^I should be able to remove the check form$/) do
  check_row = upload_and_view_forms_page.available_checks.rows.find{|row| row.title.text == @file_name.split('.').first}
  expect(check_row).to have_remove_form
  check_row.remove_form.click
end

Given(/^I have assigned a check to a check window$/) do
  step "I have uploaded a check form"
  step "I have assigned the check form to a check window"
end

When(/^I decide i want to remove the check from the check window$/) do
  window = assign_form_to_window_page.check_windows.rows.find{|row| row.name_of_window.text.include? @check_window_hash[:check_name]}
  window.name_of_window.click
  check_row = unassign_form_page.check_forms.rows.find{|row| row.name_of_form.text == @file_name.split('.').first}
  check_row.remove_from_window.click
end

Then(/^the check should be unassigned from that check window$/) do
  upload_and_view_forms_page.load
  check_row = upload_and_view_forms_page.available_checks.rows.find{|row| row.title.text == @file_name.split('.').first}
  expect(check_row.assigned_to.text).to eql 'Unassigned'
end

When(/^I attempt to assign the same form to the window again$/) do
  window = assign_form_to_window_page.check_windows.rows.find{|row| row.name_of_window.text.include? @check_window_hash[:check_name]}
  window.assign_form.click
end


Then(/^the list of available checks should not contain the form already assigned to the window$/) do
  available_forms = assign_form_to_window_page.check_forms.rows.map{|row| row.name_of_form.text}
  expect(available_forms).to_not include @file_name.split('.').first
end