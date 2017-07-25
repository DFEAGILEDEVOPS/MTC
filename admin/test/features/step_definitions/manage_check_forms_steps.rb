Given(/^I am on the manage check forms page$/) do
  manage_check_forms_page.load
end

Then(/^I should see a heading$/) do
  expect(manage_check_forms_page).to have_heading
end

Then(/^I should have the option to choose a csv file$/) do
  expect(manage_check_forms_page).to have_choose_file
end

Then(/^I should have the option to remove a csv file$/) do
  expect(manage_check_forms_page).to have_remove_upload
end

Then(/^I should have the option to upload a csv file$/) do
  expect(manage_check_forms_page).to have_upload
end

When(/^I upload a csv file$/) do
  @current_form_count = manage_check_forms_page.available_checks.rows.count
  driver = page.driver.browser
  driver.file_detector = lambda do |args|
    str = args.first.to_s
    str if File.exist?(str)
  end if Capybara.current_driver.to_s.include? 'bs_'
  page.attach_file('csvFile', File.expand_path('../data/fixtures/check-form-1.csv'))
  manage_check_forms_page.upload.click
end

Then(/^it should be added to the list of forms$/) do
  wait_until{expect(manage_check_forms_page.available_checks.rows.count).to eql(@current_form_count + 1)}
end

Given(/^I am ready to upload a csv file$/) do
  step "I am on the manage check forms page"
  page.attach_file('csvFile', File.expand_path('../data/fixtures/check-form-1.csv'))
end

But(/^I have removed it$/) do
  manage_check_forms_page.remove_upload.click
  manage_check_forms_page.upload.click
end

Then(/^it should not be available to be uploaded$/) do
  expect(manage_check_forms_page).to have_errors
end

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
  wait_until{expect(manage_check_forms_page.available_checks.rows.first.assigned_to.text).to eql @first_window_name + ', ' + @last_window_name}
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

Given(/^I attempt to upload a csv containing minus characters$/) do
  step "I am on the manage check forms page"
  page.attach_file('csvFile', File.expand_path('data/minus-chars.csv'))
  manage_check_forms_page.upload.click
end

Then(/^I should see error messages stating why the csv has failed to upload$/) do
  expect(manage_check_forms_page.errors).to be_all_there
end

Given(/^I attempt to upload a csv containing letters$/) do
  step "I am on the manage check forms page"
  page.attach_file('csvFile', File.expand_path('data/letters.csv'))
  manage_check_forms_page.upload.click
end

Given(/^I attempt to upload a csv containing a header row$/) do
  step "I am on the manage check forms page"
  page.attach_file('csvFile', File.expand_path('data/header-row.csv'))
  manage_check_forms_page.upload.click
end

Given(/^I attempt to upload a csv containing more than (\d+) columns$/) do |arg|
  step "I am on the manage check forms page"
  page.attach_file('csvFile', File.expand_path('data/3-columns.csv'))
  manage_check_forms_page.upload.click
end

Given(/^I attempt to upload a csv containing numbers greater than 12$/) do
  step "I am on the manage check forms page"
  page.attach_file('csvFile', File.expand_path('data/greater-than-12.csv'))
  manage_check_forms_page.upload.click
end

Given(/^I attempt to upload a file that is not a csv format$/) do
  step "I am on the manage check forms page"
  page.attach_file('csvFile', File.expand_path('data/format.txt'))
  manage_check_forms_page.upload.click
end

Given(/^I attempt to upload a csv containing decimal numbers$/) do
  step "I am on the manage check forms page"
  page.attach_file('csvFile', File.expand_path('data/decimals.csv'))
  manage_check_forms_page.upload.click
end

Given(/^I attempt to upload a csv containing quotes around the row$/) do
  step "I am on the manage check forms page"
  page.attach_file('csvFile', File.expand_path('data/quotes-around-row.csv'))
  manage_check_forms_page.upload.click
end

Given(/^I attempt to upload a csv containing quotes around the column values$/) do
  step "I am on the manage check forms page"
  @current_form_count = manage_check_forms_page.available_checks.rows.count
  page.attach_file('csvFile', File.expand_path('data/quotes-around-values.csv'))
  manage_check_forms_page.upload.click
end

Given(/^I attempt to upload a csv containing spaces around the column values$/) do
  step "I am on the manage check forms page"
  @current_form_count = manage_check_forms_page.available_checks.rows.count
  page.attach_file('csvFile', File.expand_path('data/spaces.csv'))
  manage_check_forms_page.upload.click
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