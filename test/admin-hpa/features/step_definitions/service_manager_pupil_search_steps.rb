Given(/^I am on the pupil search page$/) do
  step 'I have signed in with service-manager'
  admin_page.pupil_search.click
end

When(/^I search for a pupil using their upn$/) do
  @upn = @upns_for_school.first
  pupil_search_page.upn.set @upn
  pupil_search_page.search.click
end

Then(/^the summary page is displayed with the status set to (.+) along with details of the pupil$/) do |status|
  pupil_details = SqlDbHelper.pupil_details(@upn, @school_id)
  school_details = SqlDbHelper.find_school(@school_id)
  expect(pupil_summary_page.pupil_name.text).to eql pupil_details['lastName'] + ', ' + pupil_details['foreName'] unless current_url.include? 'pupil_search'
  expect(pupil_summary_page.dob.text).to eql pupil_details['dateOfBirth'].strftime("%-d %b %Y")
  expect(pupil_summary_page.upn.text).to eql pupil_details['upn']
  expect(pupil_summary_page.pupil_id.text).to eql pupil_details['id'].to_s
  expect(pupil_summary_page.school.text).to eql school_details['name']
  expect(pupil_summary_page.dfe_number.text).to eql school_details['dfeNumber'].to_s
  expect(pupil_summary_page.urn.text).to eql school_details['urn'].to_s
  Timeout.timeout(10){visit current_url until pupil_summary_page.status.text.eql? status}
  expect(pupil_summary_page.status.text).to eql status
end


When(/^I attempt to search using a upn that does not match$/) do
  @upn = UpnGenerator.generate
  pupil_search_page.upn.set @upn
  pupil_search_page.search.click
end

Then(/^I should see a message stating no results were found$/) do
  expect(pupil_search_page).to have_no_pupils_found
end

Given(/^I have (\d+) pupils with the same upns but at different schools$/) do |arg|
  @same_upn = @upns_for_school.first
  @urn = SqlDbHelper.get_schools_list.map {|school| school['urn']}.sort.last + 1
  dfe_number = create_dfe_number
  @school_name = "Test School - #{@urn}"
  @school = FunctionsHelper.create_school(dfe_number[:lea_code],dfe_number[:estab_code], @school_name, @urn)['entity']
  if @school['result'] == 'Failed'
    fail "#{@school['message']}"
  end
  school_uuid = @school['urlSlug']
  @username = "teacher#{@urn}"
  @school_user = FunctionsHelper.create_user(school_uuid, @username)
  @new_school_id = @school_user['entity']['school_id']
  FunctionsHelper.generate_school_pin(@new_school_id)
  p "Login for #{@school_name} created as - #{@username}"
  step 'I am logged in'
  step 'I am on the add multiple pupil page'
  @upns_for_school = add_multiple_pupil_page.upload_pupils(5, @school_name)
  page.current_window.resize_to(1270, 768)
  Capybara.visit Capybara.app_host
  p Time.now
  sign_in_page.cookies_banner.accept_all.click if sign_in_page.cookies_banner.accept_all.visible?
  visit ENV['ADMIN_BASE_URL'] + '/sign-out'
  step 'I am logged in'
  step 'I am on the Pupil Register page'
  pupil_register_page.pupil_list.pupil_row.last.names.click
  edit_pupil_page.upn.set ""
  edit_pupil_page.upn.set @same_upn
  edit_pupil_page.save_changes.click
  visit ENV['ADMIN_BASE_URL'] + '/sign-out'
end

When(/^I search for a pupil using a upn that matches more than one pupil$/) do
  pupil_search_page.upn.set @same_upn
  pupil_search_page.search.click
end

Then(/^I should see the pupil results page with a list of matched pupils$/) do
  pupil_a_details = SqlDbHelper.pupil_details(@same_upn, @school_id)
  pupil_b_details = SqlDbHelper.pupil_details(@same_upn, @new_school_id)
  [pupil_a_details, pupil_b_details].each do |pupil_details|
    pupil_row = pupil_search_page.pupil_results.pupil_row.find {|pupil| pupil.text.include? pupil_details['foreName']}
    school_details = SqlDbHelper.find_school(pupil_details['school_id'])
    expect(pupil_row.created_at.text).to eql pupil_details['createdAt'].strftime("%-d %b %Y")
    expect(pupil_row.name.text).to eql pupil_details['lastName'] + ', ' + pupil_details['foreName']
    expect(pupil_row.dob.text).to eql pupil_details['dateOfBirth'].strftime("%-d %b %Y")
    expect(pupil_row.school.text).to eql school_details['name']
    expect(pupil_row.urn.text).to eql school_details['urn'].to_s
    expect(pupil_row.dfe_number.text).to eql school_details['dfeNumber'].to_s
  end
end

Given(/^I have searched for 2 pupils with the same upn$/) do
  step 'I have 2 pupils with the same upns but at different schools'
  step 'I am on the pupil search page'
  step 'I search for a pupil using a upn that matches more than one pupil'
end

When(/^I click on one of the pupils in the list$/) do
  pupil_row = pupil_search_page.pupil_results.pupil_row.sample
  @school_id = SqlDbHelper.find_school_by_name(pupil_row.school.text)['id']
  pupil_row.name.click
  @upn = @same_upn
end


Given(/^a pupil has completed a check$/) do
  step 'I have generated a live pin for a pupil'
  step 'pupil logs in and completed the check'
  visit ENV['ADMIN_BASE_URL'] + '/sign-out'
end


And(/^I search for a pupil using the upn$/) do
  pupil_search_page.upn.set @upn
  pupil_search_page.search.click
end


Given(/^a pupil has logged into a check$/) do
  step 'I have generated a live pin for a pupil'
  pupil_detail = SqlDbHelper.pupil_details(@details_hash[:upn], @school_id)
  @pupil_id = pupil_detail['id']
  check_entry = SqlDbHelper.check_details(@pupil_id)
  pupil_pin_detail = SqlDbHelper.get_pupil_pin(check_entry['id'])
  pupil_pin = pupil_pin_detail['val']
  school_password = SqlDbHelper.find_school(pupil_detail['school_id'])['pin']
  Timeout.timeout(ENV['WAIT_TIME'].to_i) {sleep 1 until RequestHelper.auth(school_password, pupil_pin).code == 200}
  RequestHelper.auth(school_password, pupil_pin)
  @check_code = check_entry['checkCode']
  visit ENV['ADMIN_BASE_URL'] + '/sign-out'
end


Given(/^a pupil has a unconsumed restart$/) do
  step 'I submitted pupils for Restart'
  visit ENV['ADMIN_BASE_URL'] + '/sign-out'
end


Given(/^a pupil has a pin generated$/) do
  step 'I have generated a live pin for a pupil'
  visit ENV['ADMIN_BASE_URL'] + '/sign-out'
end


Given(/^there is a pupil with a processing error with a check$/) do
  step 'there is a processing error with a check'
  visit ENV['ADMIN_BASE_URL'] + '/sign-out'
  sleep 10
end


Given(/^there is a pupil that has not completed a check$/) do
  step 'there is a pupil with an incomplete status'
  visit ENV['ADMIN_BASE_URL'] + '/sign-out'
end


Given(/^a pupil is not taking a check with the reason (.*)$/) do |reason|
  step "I have a pupil not taking the check with the reason #{reason}"
  visit ENV['ADMIN_BASE_URL'] + '/sign-out'
end

Then(/^the summary page is displayed with the attendance status set to (.+) along with details of the pupil$/) do |status|
  pupil_details = SqlDbHelper.pupil_details(@upn, @school_id)
  school_details = SqlDbHelper.find_school(@school_id)
  expect(pupil_summary_page.pupil_name.text).to eql pupil_details['lastName'] + ', ' + pupil_details['foreName']
  expect(pupil_summary_page.dob.text).to eql pupil_details['dateOfBirth'].strftime("%-d %b %Y")
  expect(pupil_summary_page.upn.text).to eql pupil_details['upn']
  expect(pupil_summary_page.pupil_id.text).to eql pupil_details['id'].to_s
  expect(pupil_summary_page.school.text).to eql school_details['name']
  expect(pupil_summary_page.dfe_number.text).to eql school_details['dfeNumber'].to_s
  expect(pupil_summary_page.urn.text).to eql school_details['urn'].to_s
  expect(pupil_summary_page.status.text).to eql status
  expect(pupil_summary_page.frozen.text).to eql 'No'
end


Given(/^I have searched for a frozen pupil$/) do
  step 'the service manager has set a pupil to be frozen'
  step 'I am on the pupil search page'
  pupil_search_page.upn.set @pupil_details['upn']
  pupil_search_page.search.click
end


Then(/^the summary page displays the pupil as frozen$/) do
  expect(pupil_summary_page.frozen.text).to eql 'Frozen'
end

