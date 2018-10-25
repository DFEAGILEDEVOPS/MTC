Given(/^I logged in with user with access arrangement '(.*)'$/) do|access_arrangmenets_type|
  teacher_pupil_hash = generate_pins_overview_page.generate_pin
  pupil_pin_row = view_and_custom_print_live_check_page.pupil_list.rows.find {|row| row.name.text == teacher_pupil_hash[:pupil_name]}
  @pupil_credentials = {:school_password => pupil_pin_row.school_password.text, :pin => pupil_pin_row.pin.text}
  @school_id = SqlDbHelper.find_teacher(teacher_pupil_hash[:teacher_username])['school_id']

  ct = Time.now
  new_time = Time.new(ct.year, ct.mon, ct.day, 22, 00, 00, "+02:00").strftime("%Y-%m-%d %H:%M:%S.%LZ")
  @pupil_details = SqlDbHelper.find_pupil_from_school(teacher_pupil_hash[:pupil_name].gsub(',', '').split(' ').last, @school_id)
  access_arrangements_setting_page.set_access_arrangement(@pupil_details['id'], new_time, access_arrangmenets_type)
  sign_in_page.load
  sign_in_page.login(@pupil_credentials[:school_password], @pupil_credentials[:pin])
  sign_in_page.sign_in_button.click
  fail 'WORK IN PROGRESS'
  confirmation_page.read_instructions.click
end

Then(/^I can see setting page as per design$/) do
  expect(access_arrangements_setting_page).to have_heading
  expect(access_arrangements_setting_page).to have_information
  expect(access_arrangements_setting_page).to have_sign_out
  expect(access_arrangements_setting_page).to have_next_btn
  expect(access_arrangements_setting_page).to have_access_arrangements_list
end

Then(/^I can see setting page for input assistance as per design$/) do
  step 'I can see setting page as per design'
  expect(access_arrangements_setting_page).to have_input_assistance_message
  expect(access_arrangements_setting_page).to have_input_assistance_first_name
  expect(access_arrangements_setting_page).to have_input_assistance_last_name
end

Then(/^I can see following access arrangement$/) do |table|
  i=0
  table.hashes.each do |hash|
    expected_access_arr_type = hash['access_arrangement_type']
    actual_access_arr_type = access_arrangements_setting_page.access_arrangements_list[i].text
    i= i+1
    expect(actual_access_arr_type.eql?(expected_access_arr_type)).to be_truthy, "Expected: #{expected_access_arr_type}...but got Actual: #{actual_access_arr_type}"
  end
end

When(/^I click Next button on setting page$/) do
  access_arrangements_setting_page.next_btn.click
end

Then(/^I can see following message for input assistance$/) do|table|
  table.hashes.each do |hash|
    expect(access_arrangements_setting_page.error_summary.error_list.text.include?(hash['error_message'])).to be_truthy, "Expected: #{hash['error_message']}....but Got #{access_arrangements_setting_page.error_summary.error_list.text} "
  end
end