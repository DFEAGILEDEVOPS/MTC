Then(/^I should see (.*)'s school name$/) do |teacher|
  school_id = SqlDbHelper.find_teacher(teacher)['school_id']
  school_name = SqlDbHelper.find_school(school_id)['name']
  expect(school_landing_page.heading.text).to eql "Manage the multiplication tables check for " + school_name
end

Then(/^I should see the school name corresponding to that (.*)$/) do |dfe_number|
  school_name = SqlDbHelper.find_school_by_dfeNumber(dfe_number)['name']
  expect(school_landing_page.heading.text).to eql "Manage the multiplication tables check for " + school_name
end

Given(/^I am on the school landing page$/) do
  step "I am logged in"
  expect(school_landing_page).to be_displayed
end

Then(/^I should see an option to go to the manage pupils area$/) do
  expect(school_landing_page).to have_manage_pupil_instructions
  school_landing_page.manage_pupil.click
  expect(manage_pupil_page).to be_displayed
end

Then(/^I should see an option to go to the submit the attendance register area$/) do
  expect(school_landing_page).to have_submit_attendance_register
end

Then(/^I should see an option to view the results$/) do
  expect(school_landing_page).to have_results_disabled
end

When(/^I decide to logout$/) do
  school_landing_page.sign_out.click
end

Then(/^I am taken back to the login page$/) do
  p current_url
  expect(sign_in_page).to be_displayed
end

Then(/^I should see option to view guidance in the before you start section$/) do
  expect(school_landing_page).to have_guidance
end

Then(/^I should see option to manage check forms in the before you start section$/) do
  expect(school_landing_page.before_you_start).to have_manage_check_forms
end

Then(/^I should see (.*)'s name$/) do |teacher|
  expect(school_landing_page.teacher_name.text).to eql "Signed in as " + teacher
end

Then(/^I should see an option to view the pupil register$/) do
  expect(school_landing_page).to have_pupil_register
end

Then(/^I should see an option to group pupils$/) do
  expect(school_landing_page).to have_group_pupils
end

Then(/^I should see an option to select pupils not taking the check$/) do
  expect(school_landing_page).to have_pupils_not_taking_check
end

Then(/^I should see an option to manage access arrangements$/) do
  expect(school_landing_page).to have_access_arrangements
end

Then(/^I should see an option to generate tio and live pins$/) do
  expect(school_landing_page).to have_generate_passwords_and_pins
end

Then(/^I should see an option to generate pins familiarisation$/) do
  expect(school_landing_page).to have_generate_pupil_pin_familiarisation
end

Then(/^I should see an option to manage restarts$/) do
  expect(school_landing_page).to have_restarts
end

Then(/^I should see an option to complete the hdf$/) do
  expect(school_landing_page).to have_hdf
end

Then(/^I should see a disabled option for the hdf$/) do
  expect(school_landing_page).to have_hdf_disabled
  expect(school_landing_page).to have_hdf_disabled_text
end

Then(/^I should see the school landing page matches design$/) do

  step "I should see an option to view the pupil register"
  step "I should see an option to group pupils"
  step "I should see an option to select pupils not taking the check"
  step "I should see an option to select pupils not taking the check"
  step "I should see an option to manage access arrangements"
  step "I should see an option to generate tio and live pins"
  step "I should see an option to manage restarts"
  step "I should see an option to complete the hdf"
  step "I should see an option to view the results"
  step "I should see option to view guidance in the before you start section"
end

Given(/^I should see a step by step navigation section$/) do
  expect(school_landing_page.mtc_process).to be_all_there
end

Given(/^there is a pupil with an incomplete status$/) do
  step 'I have generated a live pin for a pupil'
  RequestHelper.auth(@pupil_credentials[:school_password], @pupil_credentials[:pin])
  sleep 65
end

Then(/^I should see a incomplete banner$/) do
  SafeTimeout.timeout(ENV['WAIT_TIME'].to_i) {visit current_url until school_landing_page.has_incomplete_banner?}
  expect(school_landing_page).to have_incomplete_banner
  expect(school_landing_page).to have_incomplete_banner_text
end

When(/^I navigate to the school landing page$/) do
  school_landing_page.load
end


And(/^I enter and submit a valid (.*) for impersonation$/) do |dfenumber|

  helpdesk_impersonation_page.dfe_number.set dfenumber
  sleep 2
  helpdesk_impersonation_page.submit.click
end


Then(/^I should be taken to the teachers school homepage corresponding to that (.*)$/) do |dfenumber|
  school_name = SqlDbHelper.find_school_by_dfeNumber(dfenumber)['name']
  expect(school_landing_page.heading.text).to eql "Manage the multiplication tables check for " + school_name
  expect(school_landing_page).to have_pupil_register
  expect(school_landing_page).to have_remove_impersonation
end


Given(/^I have impersonated a school with the helpdesk user$/) do
  step 'I have signed in with helpdesk'
  step 'I enter and submit a valid 2011001 for impersonation'
end


When(/^I want to remove the impersonation$/) do
  school_landing_page.remove_impersonation.click
end

Then(/^I am taken back to the helpdesk impersonation page$/) do
  expect(helpdesk_impersonation_page).to be_displayed
  expect(helpdesk_impersonation_page).to have_impersonation_removed
end


Given(/^I am on the helpdesk impersonation page$/) do
  step 'I have signed in with helpdesk'
end

When(/^I want to sign out as a helpdesk user$/) do
  helpdesk_impersonation_page.sign_out.click
end


When(/^I enter (.*) as the Dfe number$/) do |invalid_dfe_number|
  helpdesk_impersonation_page.dfe_number.set invalid_dfe_number
  helpdesk_impersonation_page.submit.click
end


Then(/^I am shown an error stating the value does not match a school$/) do
  expect(helpdesk_impersonation_page.error_summary.map {|error| error.text}).to eql ["The school DfE number provided does not match a school in the MTC database"]
  expect(helpdesk_impersonation_page.error_message.map {|error| error.text}).to eql ["The school DfE number provided does not match a school in the MTC database"]
end


Then(/^I am shown an error stating the value is in the incorrect format$/) do
  expect(helpdesk_impersonation_page.error_summary.map {|error| error.text}).to eql ["The school DfE number provided has an incorrect format"]
  expect(helpdesk_impersonation_page.error_message.map {|error| error.text}).to eql ["The school DfE number provided has an incorrect format"]
end


Then(/^I should be able to navigate to the (.*)$/) do |page|
  school_landing_page.send(page).click
  page = 'tio_or_live_pins' if page == 'generate_passwords_and_pins'
  page = 'declaration' if page == 'hdf'
  p current_url
  expect(send("#{page}_page")).to be_displayed
end


When(/^I attempt to navigate to (.*)$/) do |url|
  visit ENV['ADMIN_BASE_URL'] + url
end


And(/^I can return to the school landing page$/) do
  unauthorized_page.back_to_home.click
  expect(school_landing_page).to be_displayed
end


And(/^helpdesk tools should be displayed$/) do
  expect(school_landing_page.helpdesk_tools).to be_all_there
  sleep 2
end
