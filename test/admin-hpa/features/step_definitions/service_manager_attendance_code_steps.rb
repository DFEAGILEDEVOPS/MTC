When(/^I view all the attendance codes$/) do
  pupil_reason_page.load
  expect(pupil_reason_page.attendance_codes.size).to eql pupil_reason_page.attendance_code_mapping.size
end

Then(/^I should be able to disable the (.*) code$/) do |reason|
  visit ENV['ADMIN_BASE_URL'] + '/sign-out'
  step 'I have signed in with service-manager'
  admin_page.manage_attendance_codes.click
  manage_attendance_codes_page.disable_attendance_code(reason)
  manage_attendance_codes_page.save_changes.click
end

And(/^the (.*) code should no longer be available to teachers$/) do |reason|
  visit ENV['ADMIN_BASE_URL'] + '/sign-out'
  step 'I am logged in'
  pupil_reason_page.load
  disabled_code = pupil_reason_page.attendance_code_mapping.find{|k,v| v == reason}.first
  expect(pupil_reason_page.attendance_codes.map{|code| code['id']}).to_not include disabled_code
end
