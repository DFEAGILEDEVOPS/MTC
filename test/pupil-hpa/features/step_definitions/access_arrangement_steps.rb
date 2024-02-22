Given(/^I logged in with user with access arrangement '(.*)'$/) do |access_arrangments_type|
  step 'I add a pupil'
  step 'I login to the admin app'
  visit ENV["ADMIN_BASE_URL"] + access_arrangements_page.url
  access_arrangements_page.select_pupil_and_arrangement_btn.click
  select_access_arrangements_page.search_pupil.set(@details_hash[:first_name])
  select_access_arrangements_page.auto_search_list[0].click
  access_arrangments_type.split(',').each {|aa| select_access_arrangements_page.select_access_arrangement(aa)}
  select_access_arrangements_page.save.click
  sleep(15)

  step 'I login to the admin app'
  navigate_to_pupil_list_for_pin_gen('live')
  generate_pins_overview_page.generate_pin_using_name(@details_hash[:last_name] + ', ' + @details_hash[:first_name])
  pupil_pin_row = view_and_custom_print_live_check_page.pupil_list.rows.find {|row| row.name.text == @details_hash[:last_name] + ', ' + @details_hash[:first_name]}
  @pupil_credentials = {:school_password => pupil_pin_row.school_password.text, :pin => pupil_pin_row.pin.text}
  RedisHelper.wait_for_prepared_check(@pupil_credentials[:school_password],@pupil_credentials[:pin])

  sign_in_page.load
  sign_in_page.login(@pupil_credentials[:school_password], @pupil_credentials[:pin])
  sign_in_page.sign_in_button.click
  confirmation_page.read_instructions.click
  storage_pupil = JSON.parse page.evaluate_script('window.localStorage.getItem("pupil");')
  @check_code = storage_pupil['checkCode']
  p @check_code
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
    expected_access_arr_type = "Input assistant\nPlease enter the first and last name of the input assistant that will be helping you through the check\n\nFirst name of input assistant\nLast name of input assistant" if hash['access_arrangement_type'] == 'Input assistance'
    actual_access_arr_type = access_arrangements_setting_page.access_arrangements_list[i].text
    i= i+1
    expect(actual_access_arr_type.eql?(expected_access_arr_type)).to be_truthy, "Expected: #{expected_access_arr_type}...but got Actual: #{actual_access_arr_type}"
  end
end

When(/^I click Next button on setting page$/) do
  access_arrangements_setting_page.next_btn.click
end

Then(/^I can see following message for input assistance$/) do |table|
  table.hashes.each do |hash|
    expect(access_arrangements_setting_page.error_summary.error_list.text.include?(hash['error_message'])).to be_truthy, "Expected: #{hash['error_message']}....but Got #{access_arrangements_setting_page.error_summary.error_list.text} "
  end
end

Given(/^I logged in with user with the access arrangement '(.+)'$/) do |access_arrangments_type|
  step 'I add a pupil'
  step 'I login to the admin app'
  visit ENV["ADMIN_BASE_URL"] + access_arrangements_page.url
  access_arrangements_page.select_pupil_and_arrangement_btn.click
  select_access_arrangements_page.search_pupil.set(@details_hash[:first_name])
  select_access_arrangements_page.auto_search_list[0].click
  access_arrangments_type.split(',').each {|aa| select_access_arrangements_page.select_access_arrangement(aa)}
  select_access_arrangements_page.save.click
  sleep(15)

  step 'I login to the admin app'
  navigate_to_pupil_list_for_pin_gen('live')
  generate_pins_overview_page.generate_pin_using_name(@details_hash[:last_name] + ', ' + @details_hash[:first_name])
  pupil_pin_row = view_and_custom_print_live_check_page.pupil_list.rows.find {|row| row.name.text == @details_hash[:last_name] + ', ' + @details_hash[:first_name]}
  @pupil_credentials = {:school_password => pupil_pin_row.school_password.text, :pin => pupil_pin_row.pin.text}
  RedisHelper.wait_for_prepared_check(@pupil_credentials[:school_password],@pupil_credentials[:pin])

  sign_in_page.load
  sign_in_page.login(@pupil_credentials[:school_password], @pupil_credentials[:pin])
  sign_in_page.sign_in_button.click
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
  expect(colour_contrast_page).to have_logout
end

Then(/^I should be taken to the Welcome page once i have chosen a colour$/) do
  colour_contrast_page.next.click
  expect(confirmation_page).to be_displayed
end

Then(/^I should see the font size page matches design$/) do
  expect(font_size_page).to be_displayed
  expect(font_size_page).to have_heading
  font_size_page.very_small.click
  expect(font_size_page.very_small_preview).to be_all_there
  font_size_page.small.click
  expect(font_size_page.small_preview).to be_all_there
  font_size_page.regular.click
  expect(font_size_page.regular_preview).to be_all_there
  font_size_page.large.click
  expect(font_size_page.large_preview).to be_all_there
  font_size_page.very_large.click
  expect(font_size_page.very_large_preview).to be_all_there
  font_size_page.largest.click
  expect(font_size_page.largest_preview).to be_all_there
  expect(font_size_page).to have_setting_not_needed
  expect(font_size_page).to have_next
  expect(font_size_page).to have_logout
end

Then(/^I should be taken to the Welcome page once i have chosen a font size$/) do
  font_size_page.next.click
  expect(confirmation_page).to be_displayed
end

When(/^I start the check with no numpad$/) do
  confirmation_page.read_instructions.click if current_url.include? confirmation_page.url
  access_arrangements_setting_page.next_btn.click if current_url.include? access_arrangements_setting_page.url
  start_page.start_warm_up.click
  warm_up_page.start_now.click
end
