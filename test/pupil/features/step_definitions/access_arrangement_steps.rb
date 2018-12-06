Given(/^I logged in with user with access arrangement '(.*)'$/) do |access_arrangmenets_type|
  sign_in_page.load
  ct = Time.now
  new_time = Time.new(ct.year, ct.mon, ct.day, 22, 00, 00, "+02:00").strftime("%Y-%m-%d %H:%M:%S.%LZ")
  @pupil = SqlDbHelper.find_next_pupil
  @pin = 4.times.map {rand(2..9)}.join
  SqlDbHelper.reset_pin(@pupil['foreName'], @pupil['lastName'], @pupil['school_id'], new_time, @pin)
  current_time = Time.now + 86400
  new_time = Time.new(current_time.year, current_time.mon, current_time.day, 22, 00, 00, "+02:00").strftime("%Y-%m-%d %H:%M:%S.%LZ")
  SqlDbHelper.set_pupil_pin_expiry(@pupil['foreName'], @pupil['lastName'], @pupil['school_id'], new_time)
  SqlDbHelper.create_check(new_time, new_time, @pupil['id'])
  SqlDbHelper.set_school_pin(@pupil['school_id'], new_time, (0...3).map { (65 + rand(26)).chr }.join.downcase + '34' + (0...3).map { (65 + rand(26)).chr }.join.downcase)

  @school = SqlDbHelper.find_school(@pupil['school_id'])
  access_arrangements_setting_page.set_access_arrangement(@pupil['id'], new_time, access_arrangmenets_type)

  sign_in_page.login(@school['pin'], @pin)
  sign_in_page.sign_in_button.click

end

Then(/^I can see setting page as per design$/) do
  expect(access_arrangements_setting_page).to have_heading
  expect(access_arrangements_setting_page).to have_information
  expect(access_arrangements_setting_page).to have_sign_out
  expect(access_arrangements_setting_page).to have_next_btn
  expect(access_arrangements_setting_page).to have_access_arrangements_list
end

Then(/^I can see setting page for input assistance as per design$/) do
  confirmation_page.read_instructions.click
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
  confirmation_page.read_instructions.click
  access_arrangements_setting_page.next_btn.click
end

Then(/^I can see following message for input assistance$/) do |table|
  table.hashes.each do |hash|
    expect(access_arrangements_setting_page.error_summary.error_list.text.include?(hash['error_message'])).to be_truthy, "Expected: #{hash['error_message']}....but Got #{access_arrangements_setting_page.error_summary.error_list.text} "
  end
end


Then(/^I should see the colour contrast page matches design$/) do
  expect(colour_contrast_page).to be_displayed
  expect(colour_contrast_page).to have_heading
  colour_contrast_page.yellow_on_black_contrast.click
  expect(colour_contrast_page.yellow_on_black_preview).to be_all_there
  colour_contrast_page.black_on_white_contrast.click
  expect(colour_contrast_page.black_on_white_preview).to be_all_there
  colour_contrast_page.black_on_blue_contrast.click
  expect(colour_contrast_page.black_on_blue_preview).to be_all_there
  colour_contrast_page.black_on_peach_contrast.click
  expect(colour_contrast_page.black_on_peach_preview).to be_all_there
  colour_contrast_page.black_on_cream_contrast.click
  expect(colour_contrast_page.black_on_cream_preview).to be_all_there
  expect(colour_contrast_page).to have_setting_not_needed
  expect(colour_contrast_page).to have_next
  colour_contrast_page.logout.click
  expect(sign_in_page).to be_displayed
end

Then(/^I should be taken to the Welcome page once i have chosen a colour$/) do
  colour_contrast_page.next.click
  expect(confirmation_page).to be_displayed
end
