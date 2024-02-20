Given(/^I am on the declaration submitted page$/) do
  step 'I am on the confirm and submit page'
  step 'I submit the form with confirmation'
end

Given(/^I am on the declaration submitted page with HDF submitted with unconfirmed status$/) do
  step 'I am on the confirm and submit page'
  step 'I submit the form without confirmation'
end

Then(/^I can see the declaration submitted page as per the design$/) do
  expect(declaration_submitted_page).to have_heading
  expect(declaration_submitted_page).to have_link_to_form
  expect(declaration_submitted_page).to have_message
  expect(declaration_submitted_page).to_not have_view_results
end

And(/^I click on view declaration form$/) do
  declaration_submitted_page.link_to_form.click
end

Then(/^I am redirected to the declaration submitted form page$/) do
  expect(declaration_submitted_page).to have_current_path("/attendance/submitted-form", ignore_query: true)
  @page = declaration_submitted_form_page
end

Then(/^I can see the declaration submitted form page confirmed as per the design$/) do
  expect(declaration_submitted_form_page).to have_heading
  expect(declaration_submitted_form_page).to have_details_confirmed_list
  expect(declaration_submitted_form_page).to_not have_details_not_confirmed
end

Then(/^I can see the declaration submitted form page not confirmed as per the design$/) do
  expect(declaration_submitted_form_page).to have_heading
  expect(declaration_submitted_form_page).to_not have_details_confirmed_list
  expect(declaration_submitted_form_page).to have_details_not_confirmed
end

Given(/^I have no pupils not taking the check for the school$/) do
  SqlDbHelper.delete_pupils_not_taking_check
  SqlDbHelper.set_pupil_attendance_via_school(@school_user['entity']['school_id'], 'null')
end

Given(/^I have some pupils that have completed the check$/) do
  step "I have no pupils not taking the check for the school"
  step "I am on the add multiple pupil page"
  @upn_list = add_multiple_pupil_page.create_and_upload_multiple_pupils(3, 'pin_gen.csv')
  navigate_to_pupil_list_for_pin_gen('live')
  @pupil_names_arr = @upn_list.map {|upn| SqlDbHelper.pupil_details(upn,@school_id)['lastName'] + ', ' + SqlDbHelper.pupil_details(upn,@school_id)['foreName']}
  generate_live_pins_overview_page.generate_pin_using_list_of_names(@pupil_names_arr)
  generate_live_pins_overview_page.load
  @pupil_names_arr.each do |pupil|
    pupil_lastname = pupil.split(',')[0]
    pupil_firstname = pupil.split(',')[1].split(' Date')[0].split(' ')[0]
    pupil_detail = SqlDbHelper.pupil_details_using_names(pupil_firstname, pupil_lastname, @school_id)
    pupil_id = pupil_detail['id']
    check_entry = SqlDbHelper.check_details(pupil_id)
    pupil_pin_detail = SqlDbHelper.get_pupil_pin(check_entry['id'])
    pupil_pin = pupil_pin_detail['val']
    school_password = SqlDbHelper.find_school(pupil_detail['school_id'])['pin']
    Timeout.timeout(ENV['WAIT_TIME'].to_i) {sleep 1 until RequestHelper.auth(school_password, pupil_pin).code == 200}
    response_pupil_auth = RequestHelper.auth(school_password, pupil_pin)
    @parsed_response_pupil_auth = JSON.parse(response_pupil_auth.body)
    @check_code = check_entry['checkCode']
    FunctionsHelper.complete_check_via_check_code([@check_code])
    SqlDbHelper.wait_for_received_check(@check_code)
  end
end

When(/^the live check window closes$/) do
  @dev_phase_details_before = SqlDbHelper.check_window_details('Development Phase')
  SqlDbHelper.update_check_end_date((Date.today) - 7)
  REDIS_CLIENT. del 'checkWindow.sqlFindActiveCheckWindow'
  visit ENV['ADMIN_BASE_URL'] + '/sign-out'
  step "I am logged in with a service manager"
  admin_page.manage_check_windows.click
  @check_window = manage_check_window_page.find_check_row('Development Phase')
  @check_window.check_name.click
  add_edit_check_window_page.save_changes.click
end


And(/^I set the remaining pupils as not taking the check$/) do
  visit ENV['ADMIN_BASE_URL'] + '/sign-out'
  step "I have signed in with #{@username}"
  pupils_not_taking_check_page.load
  step 'I want to add a reason'
  @page = pupil_reason_page
  step "I select a reason"
  step "I select all pupil for pupil not taking check"
  pupil_reason_page.sticky_banner.confirm.click
end


Then(/^I should be able to submit the HDF$/) do
  step 'I am on the HDF form page'
  Timeout.timeout(120) {visit current_url until hdf_form_page.has_continue?}
  expect(@page).to have_first_name
  expect(@page).to have_last_name
  expect(@page).to have_is_headteacher_yes
  expect(@page).to have_is_headteacher_no
  expect(@page).to have_continue
end
