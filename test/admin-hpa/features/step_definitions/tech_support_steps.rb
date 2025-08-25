Then(/^I should be taken to the tech support homepage$/) do
  expect(tech_support_page).to be_displayed
  expect(tech_support_page).to have_heading
  expect(tech_support_page).to have_check_view
end

Given(/^I am on the tech support check view page$/) do
  step 'I have logged in with tech-support'
  tech_support_page.check_view.click
end

When(/^I enter a value that is not a valid UUID$/) do
  check_view_page.check_code.set SecureRandom.uuid.gsub('-', '')
  check_view_page.submit.click
end

Then(/^I should see an error stating the value is not valid$/) do
  expect(check_view_page).to have_not_valid_error
  expect(check_view_page.errors.first.text).to eql 'checkCode is not a valid UUID'
end

When(/^I submit without entering a UUID$/) do
  check_view_page.submit.click
end

Then(/^I should see an error stating the UUID is required$/) do
  expect(check_view_page).to have_required_error
  expect(check_view_page.errors.first.text).to eql 'checkCode is required'
end

Given(/^I have a checkCode from a completed check$/) do
  step 'I have generated a live pin for a pupil'
  step 'pupil logs in and completed the check'
end

When(/^I enter the checkCode from the completed check$/) do
  visit ENV['ADMIN_BASE_URL'] + '/sign-out'
  step 'I have logged in with tech-support'
  sleep 5
  tech_support_page.check_view.click
  check_view_page.check_code.set @check_code
  check_view_page.submit.click
end

Then(/^I should see the check summary$/) do
  pupil_details = SqlDbHelper.pupil_details(@details_hash[:upn], @school_id)
  pupil_id = pupil_details['id']
  check_details = SqlDbHelper.check_details(pupil_id)
  expect(check_details['checkCode']).to eql check_view_page.check_summary.check_code.text
  expect(check_details['id']).to eql check_view_page.check_summary.check_id.text.to_i
  expect(check_details['isLiveCheck']).to eql check_view_page.check_summary.type.text == 'Live'
  expect(check_details['createdAt'].strftime("%d-%m-%Y %H:%M:%S")).to eql Time.parse(check_view_page.check_summary.created_at.text).strftime("%d-%m-%Y %H:%M:%S")
  expect(SqlDbHelper.find_school(pupil_details['school_id'])['name']).to eql check_view_page.check_summary.school_name.text
  expect(SqlDbHelper.find_school(pupil_details['school_id'])['dfeNumber']).to eql check_view_page.check_summary.dfe_number.text.to_i
  expect(check_details['pupilLoginDate'].utc.strftime("%d-%m-%Y %H:%M:%S")).to eql Time.parse(check_view_page.check_summary.pupil_login_date.text).strftime("%d-%m-%Y %H:%M:%S")
  expect(check_details['receivedByServerAt'].utc.strftime("%d-%m-%Y %H:%M:%S")).to eql Time.parse(check_view_page.check_summary.recieved_at.text).strftime("%d-%m-%Y %H:%M:%S")
  expect(SqlDbHelper.get_check_pin(check_details['id'])['pinExpiresAt'].utc.strftime("%d-%m-%Y %H:%M:%S")).to eql Time.parse(check_view_page.check_summary.pin_expires_at.text).strftime("%d-%m-%Y %H:%M:%S")
  expect(check_view_page.check_summary).to have_view_payload
end

Then(/^I should see that the check failed processing$/) do
  expect(check_view_page.processing_error.text).to eql "This check has a processing error: check-validator: check validation failed. checkCode: #{@check_code} - no answers property found - answers property missing - answers property missing"
  expect(check_view_page.related).to have_marked_check_not_avail
  expect(check_view_page.related).to have_view_received_check
  expect(check_view_page.check_summary).to have_view_payload
end

Then(/^I should be able to view the links to the marked and recieved check$/) do
  expect(check_view_page.related).to have_view_received_check
  expect(check_view_page.related).to have_view_received_check
  expect(check_view_page.check_summary).to have_view_payload
end

Then(/^I should see N\/A for the marked and recieved check$/) do
  expect(check_view_page.related).to have_marked_check_not_avail
  expect(check_view_page.related).to have_received_check_not_avail
  expect(check_view_page.check_summary).to have_payload_not_avail
end
