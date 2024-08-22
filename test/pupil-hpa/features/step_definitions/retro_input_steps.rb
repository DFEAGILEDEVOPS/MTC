Given(/^I have retrospectively added an input assistant$/) do
  step 'I am on the complete page'
  step 'I login to the admin app'
  visit ENV["ADMIN_BASE_URL"] + access_arrangements_page.url
  access_arrangements_page.retro_input.link.click
  Timeout.timeout(ENV['WAIT_TIME'].to_i) {(visit current_url; retro_input_page.search_pupil.set(@details_hash[:first_name])) until
  retro_input_page.auto_search_list[0].text.include? @details_hash[:first_name]}
  retro_input_page.search_pupil.set(@details_hash[:first_name])
  retro_input_page.auto_search_list[0].click
  retro_input_page.enter_input_assistant_details
  retro_input_page.save.click
  @pupil_id = SqlDbHelper.find_pupil_via_pin(@pupil_credentials[:pin])['id']
  db_record = SqlDbHelper.get_access_arrangements_for_a_pupil(@pupil_id)
  expect(db_record.first['retroInputAssistantFirstName']).to eql 'Input'
  expect(db_record.first['retroInputAssistantLastName']).to eql 'Assistant'
  check_id = SqlDbHelper.check_details(@pupil_id)['id']
  expect(db_record.first['retroInputAssistant_check_id']).to eql check_id
end

When(/^I complete a check after a restart$/) do
  step 'I login to the admin app'
  visit ENV["ADMIN_BASE_URL"] + restarts_page.url
  restarts_page.select_pupil_to_restart_btn.click
  restarts_page.reason_1.click
  pupil = restarts_page.find_pupil_row(@details_hash[:first_name])
  @pupil_name = pupil.name.text
  pupil.checkbox.click
  restarts_page.sticky_banner.confirm.click
  navigate_to_pupil_list_for_pin_gen('live')
  generate_pins_overview_page.generate_pin_using_name(@details_hash[:last_name] + ', ' + @details_hash[:first_name])
  pupil_pin_row = view_and_custom_print_live_check_page.pupil_list.rows.find {|row| row.name.text == @details_hash[:last_name] + ', ' + @details_hash[:first_name]}
  @pupil_credentials = {:school_password => pupil_pin_row.school_password.text, :pin => pupil_pin_row.pin.text}
  RedisHelper.wait_for_prepared_check(@pupil_credentials[:school_password],@pupil_credentials[:pin])
  step 'I have logged in'
  confirmation_page.read_instructions.click
  access_arrangements_setting_page.input_assistance_first_name.set 'James'
  access_arrangements_setting_page.input_assistance_last_name.set 'Elliot'
  access_arrangements_setting_page.next_btn.click
  start_page.start_warm_up.click
  warm_up_page.start_now.click
  step "I complete the warm up questions using the keyboard"
  warm_up_complete_page.start_check.click
  start_mtc
  step 'I should be able to use the on screen keyboard to complete the test'
end

Then(/^I should not have any retro input assistant recorded against the current check$/) do
  latest_check_taken = SqlDbHelper.check_details(@pupil_id)['id']
  retro_input_check_id_array = SqlDbHelper.get_access_arrangements_for_a_pupil(@pupil_id).map {|aa| aa['retroInputAssistant_check_id']}
  expect(retro_input_check_id_array).to_not include latest_check_taken
  storage_school = JSON.parse page.evaluate_script('window.localStorage.getItem("school");')
  storage_pupil = JSON.parse page.evaluate_script('window.localStorage.getItem("pupil");')
  check_result = SqlDbHelper.wait_for_received_check(storage_pupil['checkCode'])
  storage_row = AzureTableHelper.get_row('receivedCheck', storage_school['uuid'], storage_pupil['checkCode'])
  check = JSON.parse(LZString::Base64.decompress(storage_row['archive']))
  expect(check['pupil']['inputAssistant']['firstName']).to eql 'James'
  expect(check['pupil']['inputAssistant']['lastName']).to eql 'Elliot'
end

