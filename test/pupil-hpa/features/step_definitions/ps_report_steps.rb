When(/^the data sync and ps report function has run$/) do
  step 'the data sync function has run'
  sleep ENV['PS_REPORT_WAIT_TIME'].to_i
  uuid = SqlDbHelper.find_school(@school_id)['urlSlug']
  response = FunctionsHelper.trigger_ps_function('ps-report-2-pupil-data', {name: @school_name, uuid: uuid})
  expect(response.code).to eql 202
  sleep ENV['PS_REPORT_WAIT_TIME'].to_i
  wait_until(600, 20) {SqlDbHelper.count_all_ps_records_for_school(@school_id) == @upns_for_school.size + [@details_hash[:upn]].size}
end

Then(/^I should see a record for the pupil in the ps report table$/) do
  pupil_details = SqlDbHelper.pupil_details_using_school(@details_hash[:upn], @school_id)
  reason = SqlDbHelper.get_attendance_code_for_a_pupil(pupil_details['id'])
  attendance_code_name = SqlDbHelper.check_attendance_code(reason['attendanceCode_id']) unless reason.nil?
  pupil_attendance = calculate_not_taking_reason_code(attendance_code_name['reason']) unless reason.nil?
  pupil_restarts = SqlDbHelper.pupil_restarts(pupil_details['id']).sort_by {|hsh| hsh['id']}
  @check_details = SqlDbHelper.get_all_pupil_checks(pupil_details['id']).sort_by {|hsh| hsh['createdAt']}.last
  check_config = JSON.parse SqlDbHelper.get_check_config_data(@check_details['id'])['payload'] unless @check_details.nil?
  access_arrangements = check_config.nil? ? {} : check_config.except('loadingTime', 'checkTime', 'questionTime', 'compressCompletedCheck')
  wait_until(ENV['WAIT_TIME'].to_i, 20) {!SqlDbHelper.get_check_result(@check_details['id']).nil?} unless @check_details.nil?
  check_result = SqlDbHelper.get_check_result(@check_details['id']) unless @check_details.nil?
  wait_until(ENV['WAIT_TIME'].to_i, 20) {!SqlDbHelper.get_answers(check_result['id']).nil?} unless @check_details.nil?
  check_answers = SqlDbHelper.get_answers(check_result['id']) unless @check_details.nil?
  check_events = SqlDbHelper.get_event_types_for_check(check_result['id']) unless @check_details.nil?
  check_inputs = SqlDbHelper.get_input_data(check_result['id']) unless @check_details.nil?
  device_cookie = Capybara.current_session.driver.browser.manage.cookie_named('mtc_device') unless @check_details.nil?
  device_info = SqlDbHelper.get_device_information(device_cookie[:value]) unless @check_details.nil?
  wait_until(ENV['WAIT_TIME'].to_i, 20) {!SqlDbHelper.get_ps_record_for_pupil(pupil_details['id']).nil?}
  ps_report_record = SqlDbHelper.get_ps_record_for_pupil(pupil_details['id'])
  p "PS_REPORT RECORD - " + ps_report_record["PupilId"].to_s
  ps_report_record = ps_report_record.map {|k, v| [k, (v.is_a?(BigDecimal) ? v.to_f : v)]}.to_h

  expect(ps_report_record["DOB"].strftime("%D")).to eql pupil_details["dateOfBirth"].strftime("%D")
  expect(ps_report_record["Gender"]).to eql pupil_details["gender"]
  expect(ps_report_record["PupilUPN"]).to eql pupil_details['upn']
  expect(ps_report_record["PupilId"]).to eql pupil_details['id']
  expect(ps_report_record["Forename"]).to eql pupil_details['foreName']
  expect(ps_report_record["Surname"]).to eql pupil_details['lastName']
  expect(ps_report_record["ReasonNotTakingCheck"]).to eql reason.nil? ? nil : pupil_attendance
  expect(ps_report_record["PupilStatus"]).to eql "Complete" if pupil_details['checkComplete']
  expect(ps_report_record["SchoolName"]).to eql @school_name
  expect(ps_report_record["Estab"]).to eql @estab_code
  expect(ps_report_record["SchoolURN"]).to eql @urn
  expect(ps_report_record["LANum"]).to eql 999
  expect(ps_report_record["QDisplayTime"]).to eql check_config.nil? ? nil : check_config['questionTime'].to_f
  expect(ps_report_record["PauseLength"]).to eql check_config.nil? ? nil : check_config['loadingTime'].to_f
  expect(ps_report_record["AccessArr"]).to eql access_arrangements.select {|k, v| v == true}.empty? ? "" : calculate_aa_id(access_arrangements.select {|k, v| v == true}.keys).join(',').delete(',')
  expect(ps_report_record["AttemptId"]).to eql @check_details.nil? ? nil : @check_details['checkCode']
  expect(ps_report_record["FormID"]).to eql @check_details.nil? ? nil : SqlDbHelper.get_form(@check_details['checkForm_id'])['name']
  expect(ps_report_record["TestDate"].strftime("%D")).to eql @check_details['pupilLoginDate'].strftime("%D") unless @check_details.nil?
  expect(ps_report_record["TestDate"]).to eql nil if @check_details.nil?

  expect(ps_report_record["TimeStart"]).to eql check_events.nil? ? nil : check_events.find {|event| event['eventType'] == 'CheckStarted'}['browserTimestamp']
  expect(ps_report_record["TimeComplete"]).to eql check_inputs.nil? ? nil : check_inputs.last['inputBrowserTimestamp']
  expect(ps_report_record["TimeTaken"]).to eql check_inputs.nil? ? nil : (check_inputs.last['inputBrowserTimestamp'] - check_events.find {|event| event['eventType'] == 'CheckStarted'}['browserTimestamp'])
  expect(ps_report_record["RestartNumber"]).to eql @check_details.nil? ? nil : pupil_restarts.size
  expect(ps_report_record["RestartReason"]).to eql pupil_restarts.empty? ? nil : pupil_restarts.last['restartReasonLookup_Id']
  expect(ps_report_record["FormMark"]).to eql check_result.nil? ? nil : check_result['mark']
  expect(ps_report_record["DeviceType"]).to eql nil
  expect(ps_report_record["BrowserType"]).to eql device_info.nil? ? nil : SqlDbHelper.browser_lookup(device_info['browserFamilyLookup_id'])['family'] + ' ' + device_info['browserMajorVersion'].to_s + '.' + device_info['browserMinorVersion'].to_s + '.' + device_info['browserPatchVersion'].to_s
  expect(ps_report_record["DeviceTypeModel"]).to eql nil
  expect(ps_report_record["DeviceId"]).to eql device_info.nil? ? nil : device_cookie[:value]

  25.times do |index|
    question = index + 1
    expect(ps_report_record["Q#{question}ID"]).to eql check_inputs.nil? ? nil : check_inputs.find {|inputs| inputs["questionNumber"] == question}["question"]
    expect(ps_report_record["Q#{question}Response"]).to eql check_answers.nil? ? nil : check_answers.find {|answer| answer["questionNumber"] == question}["answer"]
    input_methods = check_inputs.select {|inputs| inputs["questionNumber"] == question}.map {|input| input['name']}.uniq unless check_inputs.nil?
    expect(ps_report_record["Q#{question}InputMethods"]).to eql check_inputs.nil? ? nil : input_methods.size > 1 ? 'x' : input_methods.first.first.downcase
    expect(ps_report_record["Q#{question}K"]).to eql check_inputs.nil? ? nil : check_inputs.select {|input| input["questionNumber"] == question}.map {|input| input["name"].first.downcase + "[#{input["userInput"]}]"}.join(", ")
    expect(ps_report_record["Q#{question}Sco"]).to eql check_answers.nil? ? nil : check_answers.find {|answer| answer["questionNumber"] == question}["isCorrect"] ? 1 : 0
    first_entry_time = check_inputs.nil? ? nil : check_inputs.select {|inputs| inputs["questionNumber"] == question}.reject {|input| input["userInput"] == 'Enter'}.sort_by {|h| h["inputBrowserTimestamp"]}.first["inputBrowserTimestamp"]
    expect(ps_report_record["Q#{question}tFirstKey"]).to eql first_entry_time
    last_entry_time = check_inputs.nil? ? nil : check_inputs.select {|inputs| inputs["questionNumber"] == question}.reject {|input| input["userInput"] == 'Enter'}.sort_by {|h| h["inputBrowserTimestamp"]}.last["inputBrowserTimestamp"]
    expect(ps_report_record["Q#{question}tLastKey"]).to eql last_entry_time
    expect(ps_report_record["Q#{question}ResponseTime"]).to eql check_inputs.nil? ? nil : last_entry_time - first_entry_time
    timeout = check_inputs.nil? ? nil : check_inputs.select {|input| input["questionNumber"] == question}.find {|input| input["userInput"].eql? "Enter"} ? 0 : 1
    expect(ps_report_record["Q#{question}TimeOut"]).to eql timeout
    expect(ps_report_record["Q#{question}TimeOutResponse"]).to eql (timeout == 0 || timeout == nil) ? nil : 1
    expect(ps_report_record["Q#{question}TimeOutSco"]).to eql (timeout == 0 || timeout == nil) ? nil : 1
    question_load_time = check_events.nil? ? nil : check_events.select {|events| events["questionNumber"] == question}.find {|event| event['eventType'] == 'QuestionTimerStarted'}['browserTimestamp']
    expect(ps_report_record["Q#{question}tLoad"]).to eql question_load_time
    expect(ps_report_record["Q#{question}OverallTime"]).to eql check_inputs.nil? ? nil : last_entry_time - question_load_time
    expect(ps_report_record["Q#{question}RecallTime"]).to eql check_inputs.nil? ? nil : first_entry_time - question_load_time
    reader_started = check_events.nil? ? nil : check_events.find {|event| event['eventType'] == 'QuestionReadingStarted'}.nil? ? nil : check_events.find {|event| event['eventType'] == 'QuestionReadingStarted'}['browserTimestamp']
    expect(ps_report_record["Q#{question}ReaderStart"]).to eql reader_started
    reader_ended = check_events.nil? ? nil : check_events.find {|event| event['eventType'] == 'QuestionReadingEnded'}.nil? ? nil : check_events.find {|event| event['eventType'] == 'QuestionReadingEnded'}['browserTimestamp']
    expect(ps_report_record["Q#{question}ReaderEnd"]).to eql reader_ended
  end
  expect(@check_details['checkCode']).to eql @third_check_code unless @third_check_code.nil?
  expect(@before_taking_check).to_not eql ps_report_record["updatedAt"] unless @before_taking_check.nil?
end

And(/^I complete the check$/) do
  access_arrangements_setting_page.input_assistance_first_name.set 'Test'
  access_arrangements_setting_page.input_assistance_last_name.set 'Assistant'
  access_arrangements_setting_page.next_btn.click if current_url.include? access_arrangements_setting_page.url
  start_page.start_warm_up.click
  warm_up_page.start_now.click
  step "I complete the warm up questions using the numpad"
  warm_up_complete_page.start_check.click
  start_mtc
  @answers = check_page.complete_check_with_correct_answers(25, 'keyboard')
  complete_page.wait_for_complete_page
  expect(complete_page).to have_heading
end


Given(/^I have marked a pupil as not taking check with the (.+) reason$/) do |reason|
  @reason = reason
  step 'I add a pupil'
  step 'I login to the admin app'
  visit ENV["ADMIN_BASE_URL"] + pupil_reason_page.url
  pupil_reason_page.select_reason(@reason)
  pupil_row = pupil_reason_page.pupil_list.rows.select {|row| row.name.text.include?(@name)}
  pupil_row.first.checkbox.click
  pupil_reason_page.sticky_banner.confirm.click
end


When(/^I consume a restart using (.+) and complete the check a second time$/) do |reason|
  @first_check_code = @check_code
  step 'I login to the admin app'
  visit ENV["ADMIN_BASE_URL"] + restarts_page.url
  restarts_page.select_pupil_to_restart_btn.click
  case reason
  when "Loss of internet"
    restart_reason = restarts_page.reason_1
  when "IT issues"
    restart_reason = restarts_page.reason_2
  when "Classroom disruption"
    restart_reason = restarts_page.reason_3
  when "Did not complete"
    restart_reason = restarts_page.reason_4
  else
    fail reason + ' not found'
  end
  restart_reason.click
  restarts_page.reason_3_textbox.set 'This is a test' if restart_reason == restarts_page.reason_3
  restarts_page.reason4_explanation_input.set 'This is a another test' if restart_reason == restarts_page.reason_4
  pupil = restarts_page.find_pupil_row(@details_hash[:first_name])
  @pupil_name = pupil.name.text
  pupil.checkbox.click
  restarts_page.sticky_banner.confirm.click
  navigate_to_pupil_list_for_pin_gen('live')
  generate_pins_overview_page.generate_pin_using_name(@details_hash[:last_name] + ', ' + @details_hash[:first_name])
  pupil_pin_row = view_and_custom_print_live_check_page.pupil_list.rows.find {|row| row.name.text == @details_hash[:last_name] + ', ' + @details_hash[:first_name]}
  @pupil_credentials = {:school_password => pupil_pin_row.school_password.text, :pin => pupil_pin_row.pin.text}
  AzureTableHelper.wait_for_prepared_check(@pupil_credentials[:school_password], @pupil_credentials[:pin])
  step 'I have logged in'
  confirmation_page.read_instructions.click
  start_page.start_warm_up.click
  warm_up_page.start_now.click
  step "I complete the warm up questions using the keyboard"
  warm_up_complete_page.start_check.click
  start_mtc
  step 'I should be able to use the on screen keyboard to complete the test'
  storage_pupil = JSON.parse page.evaluate_script('window.localStorage.getItem("pupil");')
  @second_check_code = storage_pupil['checkCode']
end

And(/^I consume another restart using IT issues and complete the check a third time$/) do
  step 'I login to the admin app'
  visit ENV["ADMIN_BASE_URL"] + restarts_page.url
  restarts_page.select_pupil_to_restart_btn.click
  restarts_page.reason_2.click
  pupil = restarts_page.find_pupil_row(@details_hash[:first_name])
  @pupil_name = pupil.name.text
  pupil.checkbox.click
  restarts_page.sticky_banner.confirm.click
  navigate_to_pupil_list_for_pin_gen('live')
  generate_pins_overview_page.generate_pin_using_name(@details_hash[:last_name] + ', ' + @details_hash[:first_name])
  pupil_pin_row = view_and_custom_print_live_check_page.pupil_list.rows.find {|row| row.name.text == @details_hash[:last_name] + ', ' + @details_hash[:first_name]}
  @pupil_credentials = {:school_password => pupil_pin_row.school_password.text, :pin => pupil_pin_row.pin.text}
  AzureTableHelper.wait_for_prepared_check(@pupil_credentials[:school_password], @pupil_credentials[:pin])
  step 'I have logged in'
  confirmation_page.read_instructions.click
  start_page.start_warm_up.click
  warm_up_page.start_now.click
  step "I complete the warm up questions using the keyboard"
  warm_up_complete_page.start_check.click
  start_mtc
  step 'I should be able to use the on screen keyboard to complete the test'
  storage_pupil = JSON.parse page.evaluate_script('window.localStorage.getItem("pupil");')
  @third_check_code = storage_pupil['checkCode']
end

And(/^I see the ps report record for the pupil$/) do
  step 'the data sync and ps report function has run'
  pupil_details = SqlDbHelper.pupil_details_using_school(@details_hash[:upn], @school_id)
  wait_until(ENV['WAIT_TIME'].to_i) {!SqlDbHelper.get_ps_record_for_pupil(pupil_details['id']).nil?}
  ps_report_record = SqlDbHelper.get_ps_record_for_pupil(pupil_details['id'])
  @before_taking_check = ps_report_record["updatedAt"]
  25.times do |index|
    question = index + 1
    expect(ps_report_record["Q#{question}ID"]).to eql nil
    expect(ps_report_record["Q#{question}Response"]).to eql nil
    expect(ps_report_record["Q#{question}InputMethods"]).to eql nil
    expect(ps_report_record["Q#{question}K"]).to eql nil
    expect(ps_report_record["Q#{question}Sco"]).to eql nil
    expect(ps_report_record["Q#{question}tFirstKey"]).to eql nil
    expect(ps_report_record["Q#{question}tLastKey"]).to eql nil
    expect(ps_report_record["Q#{question}ResponseTime"]).to eql nil
    expect(ps_report_record["Q#{question}TimeOut"]).to eql nil
    expect(ps_report_record["Q#{question}TimeOutResponse"]).to eql nil
    expect(ps_report_record["Q#{question}TimeOutSco"]).to eql nil
    expect(ps_report_record["Q#{question}tLoad"]).to eql nil
    expect(ps_report_record["Q#{question}OverallTime"]).to eql nil
    expect(ps_report_record["Q#{question}RecallTime"]).to eql nil
    expect(ps_report_record["Q#{question}ReaderStart"]).to eql nil
    expect(ps_report_record["Q#{question}ReaderEnd"]).to eql nil
  end
end

When(/^the pupil completes the check$/) do
  step 'I have logged in'
  confirmation_page.read_instructions.click
  start_page.start_warm_up.click
  warm_up_page.start_now.click
  step "I complete the warm up questions using the keyboard"
  warm_up_complete_page.start_check.click
  start_mtc
  questions = JSON.parse page.evaluate_script('window.localStorage.getItem("questions");')
  check_page.complete_check_with_correct_answers(questions.size, 'numpad')
  complete_page.wait_for_complete_page
  expect(complete_page).to have_completion_text
  storage1 = page.evaluate_script('window.localStorage;')
  @check_code = JSON.parse(storage1['pupil'])['checkCode']
  @school_uuid = JSON.parse(storage1['school'])['uuid']
  storage_audit_keys = storage1.keys.select {|x| x.include?('audit')}
  @audit = []
  storage_audit_keys.each do |key|
    @audit << (JSON.parse page.evaluate_script("window.localStorage.getItem('#{key}');"))
  end
  p @check_code
end

Then(/^the ps report record should be updated with all the check details$/) do
  step 'I should see a record for the pupil in the ps report table'
end

And(/^the latest check is recorded$/) do
  expect(@check_details['checkCode']).eql? @second_check_code
end

When(/^I add an AA arrangement$/) do
  access_arrangments_type = "Audible time alert"
  visit ENV["ADMIN_BASE_URL"] + access_arrangements_page.url
  access_arrangements_page.select_pupil_and_arrangement_btn.click
  select_access_arrangements_page.search_pupil.set(@details_hash[:first_name])
  select_access_arrangements_page.auto_search_list[0].click
  access_arrangments_type.split(',').each {|aa| select_access_arrangements_page.select_access_arrangement(aa)}
  select_access_arrangements_page.save.click
  sleep(15)
end

And(/^complete the check$/) do
  step 'I have logged in'
  access_arrangements_setting_page.next_btn.click
  confirmation_page.read_instructions.click
  start_page.start_warm_up.click
  warm_up_page.start_now.click
  step "I complete the warm up questions using the numpad"
  warm_up_complete_page.start_check.click
  start_mtc
  questions = JSON.parse page.evaluate_script('window.localStorage.getItem("questions");')
  check_page.complete_check_with_correct_answers(questions.size, 'numpad')
  complete_page.wait_for_complete_page
  expect(complete_page).to have_completion_text
  storage1 = page.evaluate_script('window.localStorage;')
  @check_code = JSON.parse(storage1['pupil'])['checkCode']
  @school_uuid = JSON.parse(storage1['school'])['uuid']
  storage_audit_keys = storage1.keys.select {|x| x.include?('audit')}
  @audit = []
  storage_audit_keys.each do |key|
    @audit << (JSON.parse page.evaluate_script("window.localStorage.getItem('#{key}');"))
  end
  p @check_code
end

Then(/^the PS report should include the AA for the pupil$/) do
  step 'the data sync and ps report function has run'
  step 'I should see a record for the pupil in the ps report table'
  pupil_details = SqlDbHelper.pupil_details_using_school(@details_hash[:upn], @school_id)
  pupil_aa = SqlDbHelper.get_ps_record_for_pupil(pupil_details['id'])['AccessArr']
  expect(pupil_aa).to eql '[1]'
end

Given(/^I generated a pin after applying a restart$/) do
  step "I have completed the check"
  step 'I login to the admin app'
  visit ENV["ADMIN_BASE_URL"] + restarts_page.url
  restarts_page.select_pupil_to_restart_btn.click
  restarts_page.reason_2.click
  pupil = restarts_page.find_pupil_row(@details_hash[:first_name])
  @pupil_name = pupil.name.text
  pupil.checkbox.click
  restarts_page.sticky_banner.confirm.click
  navigate_to_pupil_list_for_pin_gen('live')
  generate_pins_overview_page.generate_pin_using_name(@details_hash[:last_name] + ', ' + @details_hash[:first_name])
  pupil_pin_row = view_and_custom_print_live_check_page.pupil_list.rows.find {|row| row.name.text == @details_hash[:last_name] + ', ' + @details_hash[:first_name]}
  @pupil_credentials = {:school_password => pupil_pin_row.school_password.text, :pin => pupil_pin_row.pin.text}
  p @pupil_credentials
  AzureTableHelper.wait_for_prepared_check(@pupil_credentials[:school_password], @pupil_credentials[:pin])
end

But(/^the pin expires$/) do
  @pupil_details = SqlDbHelper.pupil_details_using_school(@details_hash[:upn], @school_id)
  @check_details = SqlDbHelper.get_all_pupil_checks(@pupil_details['id']).sort_by {|hsh| hsh['createdAt']}.last
  SqlDbHelper.delete_check_pin(@check_details["id"])
end

When(/^I generate a new pin and complete the check$/) do
  navigate_to_pupil_list_for_pin_gen('live')
  generate_pins_overview_page.generate_pin_using_name(@details_hash[:last_name] + ', ' + @details_hash[:first_name])
  pupil_pin_row = view_and_custom_print_live_check_page.pupil_list.rows.find {|row| row.name.text == @details_hash[:last_name] + ', ' + @details_hash[:first_name]}
  @pupil_credentials = {:school_password => pupil_pin_row.school_password.text, :pin => pupil_pin_row.pin.text}
  p @pupil_credentials
  AzureTableHelper.wait_for_prepared_check(@pupil_credentials[:school_password], @pupil_credentials[:pin])
  step 'I have logged in'
  confirmation_page.read_instructions.click
  start_page.start_warm_up.click
  warm_up_page.start_now.click
  step "I complete the warm up questions using the numpad"
  warm_up_complete_page.start_check.click
  start_mtc
  questions = JSON.parse page.evaluate_script('window.localStorage.getItem("questions");')
  check_page.complete_check_with_correct_answers(questions.size, 'numpad')
  complete_page.wait_for_complete_page
  expect(complete_page).to have_completion_text
  storage1 = page.evaluate_script('window.localStorage;')
  @check_code = JSON.parse(storage1['pupil'])['checkCode']
  @school_uuid = JSON.parse(storage1['school'])['uuid']
  storage_audit_keys = storage1.keys.select {|x| x.include?('audit')}
  @audit = []
  storage_audit_keys.each do |key|
    @audit << (JSON.parse page.evaluate_script("window.localStorage.getItem('#{key}');"))
  end
  p @check_code
end

Then(/^I should see the restart reason in the ps report record$/) do
  ps_report_record = SqlDbHelper.get_ps_record_for_pupil(@pupil_details['id'])
  expect(ps_report_record['RestartReason']).to eql 2
end

Given(/^I have completed the check for a pupil attending a test school$/) do
  SqlDbHelper.set_school_as_test_school(@school['entity']['dfeNumber'])
  step 'I have completed the check'
end

Then(/^I should not see any records for the test school$/) do
  expect(SqlDbHelper.count_all_ps_records_for_school(@school_id)).to eql 0
end

When(/^the data sync and ps report function has run for the test school$/) do
  step 'the data sync function has run'
  sleep ENV['PS_REPORT_WAIT_TIME'].to_i
  uuid = SqlDbHelper.find_school(@school_id)['urlSlug']
  response = FunctionsHelper.trigger_ps_function('ps-report-2-pupil-data', {name: @school_name, uuid: uuid})
  expect(response.code).to eql 202
  sleep ENV['PS_REPORT_WAIT_TIME'].to_i
end

Given(/^I have completed a check with duplicate questions$/) do
  name = (0...8).map {(65 + rand(26)).chr}.join
  step 'I add a pupil'
  step 'I login to the admin app'
  navigate_to_pupil_list_for_pin_gen('live')
  generate_pins_overview_page.generate_pin_using_name(@details_hash[:last_name] + ', ' + @details_hash[:first_name])
  pupil_pin_row = view_and_custom_print_live_check_page.pupil_list.rows.find {|row| row.name.text == @details_hash[:last_name] + ', ' + @details_hash[:first_name]}
  @pupil_credentials = {:school_password => pupil_pin_row.school_password.text, :pin => pupil_pin_row.pin.text}
  p @pupil_credentials
  AzureTableHelper.wait_for_prepared_check(@pupil_credentials[:school_password], @pupil_credentials[:pin])
  @check_code = SqlDbHelper.check_details(@stored_pupil_details['id'])['checkCode']
  @pupil_id = @stored_pupil_details['id']
  check_entry = SqlDbHelper.check_details(@pupil_id)
  Timeout.timeout(ENV['WAIT_TIME'].to_i) {sleep 1 until RequestHelper.auth(@pupil_credentials[:school_password], @pupil_credentials[:pin]).code == 200}
  RequestHelper.auth(@pupil_credentials[:school_password], @pupil_credentials[:pin])
  @check_code = check_entry['checkCode']
  FunctionsHelper.complete_check_with_duplicates([@check_code], 25, 0, rand(25)) if check_entry["isLiveCheck"]
  @recieved_check = AzureTableHelper.wait_for_received_check(@school['entity']['urlSlug'], @check_code) if check_entry["isLiveCheck"]
  p @check_code
end

Then(/^I should see the ps report showing the first input$/) do
  @answers = JSON.parse(LZString::UTF16.decompress(@recieved_check['archive']))['answers']
  grouped = @answers.group_by {|row| [row['sequenceNumber'], row['question']]}
  duplicates = grouped.values.select {|a| a.size > 1}
  expected_answers = duplicates.map {|d| d.first['answer']}
  expected_questions = duplicates.map {|d| d.first['sequenceNumber'].to_s}
  ps_report_record = SqlDbHelper.get_ps_record_for_pupil(@pupil_id)
  answers = expected_questions.map {|question| ps_report_record["Q#{question}Response"]}
  expect(expected_answers).to eql answers
end


Given(/^I have annulled a pupil$/) do
  step 'I add a pupil'
  pupil_upn = @details_hash[:upn]
  @pupil_details = SqlDbHelper.pupil_details(pupil_upn)
  annul_pupil(pupil_upn, @school_id)
end


And(/^I should see the correct code for an annulled pupil$/) do
  pupil_details = SqlDbHelper.pupil_details_using_school(@details_hash[:upn], @school_id)
  ps_report_record = SqlDbHelper.get_ps_record_for_pupil(pupil_details['id'])
  expect(ps_report_record["ReasonNotTakingCheck"]).to eql 'Q'
end


Given(/^I have removed a pupils annulment$/) do
  step 'I have annulled a pupil'
  step 'the data sync and ps report function has run'
  step 'I should see a record for the pupil in the ps report table'
  step 'I should see the correct code for an annulled pupil'
  undo_annulment(@details_hash[:upn], @school_id)

end


And(/^I should see the annulment has been removed$/) do
  pupil_details = SqlDbHelper.pupil_details_using_school(@details_hash[:upn], @school_id)
  ps_report_record = SqlDbHelper.get_ps_record_for_pupil(pupil_details['id'])
  expect(ps_report_record["ReasonNotTakingCheck"]).to be_nil
end


And(/^I remove a previously applied annulment$/) do
  pupil_upn = @details_hash[:upn]
  @pupil_details = SqlDbHelper.pupil_details(pupil_upn)
  annul_pupil(pupil_upn, @school_id)
  step 'the data sync and ps report function has run'
  step 'I should see a record for the pupil in the ps report table'
  step 'I should see the correct code for an annulled pupil'
  undo_annulment(@details_hash[:upn], @school_id)
end

And(/^this is code is stored$/) do
  reason = SqlDbHelper.get_attendance_code_for_a_pupil(@stored_pupil_details['id'])
  attendance_code_name = SqlDbHelper.check_attendance_code(reason['attendanceCode_id'])
  @original_pupil_attendance = calculate_not_taking_reason_code(attendance_code_name['reason'])
end
