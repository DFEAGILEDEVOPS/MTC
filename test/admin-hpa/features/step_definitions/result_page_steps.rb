Given(/^multiple pupils have completed the check/) do
  @expected_marks = [0, 15, 25]
  @expected_marks.each do |expected_score|
    step "my check has been marked with #{expected_score} correct answers"
    sleep 2
    visit ENV['ADMIN_BASE_URL'] + '/sign-out'
  end
end

When(/^we are in (.*) week of check end date$/) do |check_end_week|
  today_date = Date.today
  case check_end_week
  when '1st'
    SqlDbHelper.update_check_end_date(prior_fridays(today_date,1))
  when '2nd'
    SqlDbHelper.update_check_end_date(prior_fridays(today_date,2))
  end
  REDIS_CLIENT.keys.each do |key|
    if key.include?('checkWindow.sqlFindActiveCheckWindow')
      REDIS_CLIENT.del key
    end
  end
end

And(/^we navigate to the Result page$/) do
  step "I am logged in"
  school_landing_page.load
  wait_until(30,2){visit current_url; school_landing_page.has_results?}
  school_landing_page.results.click
end

Then(/^I should see the provisional results page with a message stating the hdf needs to be signed$/) do
  Timeout.timeout(120) {pupil_register_page.load until REDIS_CLIENT.get("checkWindow.sqlFindActiveCheckWindow") != nil}
  today_date = Date.today
  if today_date.saturday? || today_date.sunday?
    expect(results_page).to have_heading
  else
    results_page.load
    expect(results_page).to have_heading
    expect(results_page).to have_no_hdf_message
    expect(results_page).to have_hdf_button
  end

end

Then(/^Result page is displayed as per the design$/) do
  expect(results_page).to have_heading
  expect(results_page).to have_results
end

And(/^I have submitted the HDF$/) do
  visit ENV['ADMIN_BASE_URL'] + '/sign-out'
  step 'I am logged in'
  school_landing_page.load
  school_landing_page.hdf.click
  Timeout.timeout(120) {visit current_url until hdf_form_page.has_continue?}
  name = (0...8).map {(65 + rand(26)).chr}.join
  @hdf_details_hash = {first_name: name, last_name: name}
  hdf_form_page.enter_details(@hdf_details_hash)
  hdf_form_page.continue.click
  declaration_review_pupils_page.continue_button.click
  declaration_confirm_page.submit_valid_confirmed
  expect(declaration_submitted_page).to be_displayed
end

And(/^the check window closed last friday$/) do
  today_date = Date.today
  today_date = today_date - 7 if today_date.friday?
  while !today_date.friday?
    today_date -= 1
  end
  SqlDbHelper.update_check_end_date(today_date)
end

Then(/^I should see the school results$/) do
  checks_ids_from_school = SqlDbHelper.get_all_checks_from_school(@school_user['school_id']).map {|check| check['id']}
  checks_ids_from_school.each {|id| SqlDbHelper.wait_for_check_result(id)}
  school_landing_page.load
  wait_until(30,2){visit current_url; school_landing_page.has_results?}
  school_landing_page.results.click
  expect(results_page).to have_heading
  expect(results_page).to_not have_no_hdf_message
  expect(results_page).to_not have_hdf_button
  expect(results_page).to have_ctf_download
  pupils = results_page.results.pupil_list.map {|pupil| pupil unless pupil.score.text == '-'}.compact
  pupil_results = pupils.map {|pupil| {id: SqlDbHelper.get_check_id_using_names(pupil.name.text.split(',')[0], pupil.name.text.split(',')[1].strip, @school_id)['id'].to_s, mark: pupil.score.text}}.sort_by {|hsh| hsh[:id]}
  db_pupil_results = checks_ids_from_school.map {|check| {id: check.to_s, mark: SqlDbHelper.get_check_result(check)['mark'].to_s}}.sort_by {|hsh| hsh[:id]}
  expect(db_pupil_results).to eql pupil_results
  results_page.ctf_download.click
  ctf_path = File.expand_path("#{File.dirname(__FILE__)}/../../data/download/#{@school['dfeNumber']}_MTC_#{@school['dfeNumber']}_001.xml")
  wait_until(120,5){File.exist?(ctf_path)}
  ctf_file = File.read(ctf_path)
  doc = Nokogiri::XML ctf_file
  ctf_results_hash = doc.css('Pupil').map {|p| {name: p.children.css('Forename').text + ", " + p.children.css('Surname').text, mark: p.children.css('Result').text}}.sort_by {|hsh| hsh[:name]}
  pupil_results_hash = results_page.results.pupil_list.map {|pupil| {name: pupil.name.text.split(',')[0] + ", " + pupil.name.text.split(',')[1].strip, mark: (pupil.score.text == '-' ? 'A' : pupil.score.text) }}.sort_by {|hsh| hsh[:name]}
  expect(ctf_results_hash).to eql pupil_results_hash
end


And(/^the check window closed two friday's ago$/) do
  two_weeks_ago = Date.today - 14
  while !two_weeks_ago.friday?
    two_weeks_ago -= 1
  end
  SqlDbHelper.update_check_end_date(two_weeks_ago)
end


But(/^I have not signed the hdf$/) do
  visit ENV['ADMIN_BASE_URL'] + '/sign-out'
  step 'I am logged in'
  school_landing_page.hdf.click
  Timeout.timeout(120) {(visit current_url; sleep 2) until hdf_form_page.has_continue?}
end


Then(/^I should be able to view school results but not download the ctf$/) do
  checks_ids_from_school = SqlDbHelper.get_all_checks_from_school(@school_user['school_id']).map {|check| check['id']}
  checks_ids_from_school.each {|id| SqlDbHelper.wait_for_check_result(id)}
  school_landing_page.load
  wait_until(30,2){visit current_url; school_landing_page.has_results?}
  school_landing_page.results.click
  expect(results_page).to have_heading
  expect(results_page).to_not have_no_hdf_message
  expect(results_page).to_not have_hdf_button
  expect(results_page).to have_ctf_download_disabled
  pupils = results_page.results.pupil_list.map {|pupil| pupil unless pupil.score.text == '-'}.compact
  pupil_results = pupils.map {|pupil| {id: SqlDbHelper.get_check_id_using_names(pupil.name.text.split(',')[0], pupil.name.text.split(',')[1].strip, @school_id)['id'].to_s, mark: pupil.score.text}}.sort_by {|hsh| hsh[:id]}
  db_pupil_results = checks_ids_from_school.map {|check| {id: check.to_s, mark: SqlDbHelper.get_check_result(check)['mark'].to_s}}.sort_by {|hsh| hsh[:id]}
  expect(db_pupil_results).to eql pupil_results
end


And(/^some pupils who have been marked as not taking the check$/) do
  step 'I am logged in'
  ["Incorrect registration",
   "Left school",
   "Unable to access",
   "Working below expectation",
   "Just arrived and unable to establish abilities"].each do |reason|
    @name = (0...8).map {(65 + rand(26)).chr}.join
    step "I am on the add pupil page"
    step "I submit the form with the name fields set as #{@name}"
    step "the pupil details should be stored"
    pupils_not_taking_check_page.load
    step 'I want to add a reason'
    pupil_reason_page
    pupil_reason_page.select_reason(reason)
    @pupil_row = pupil_reason_page.pupil_list.rows.select {|row| row.name.text.include?(@name)}
    @pupil_forename = @pupil_row.first.name.text.split(',')[1].strip
    @pupil_lastname = @pupil_row.first.name.text.split(',')[0].strip
    @pupil_row.first.checkbox.click
    pupil_reason_page.sticky_banner.confirm.click
  end
end

Then(/^I should see the results and reasons for not taking the check$/) do
  checks_ids_from_school = SqlDbHelper.get_all_checks_from_school(@school_user['school_id']).map {|check| check['id']}
  checks_ids_from_school.each {|id| SqlDbHelper.wait_for_check_result(id)}
  school_landing_page.load
  wait_until(30,2){visit current_url; school_landing_page.has_results?}
  school_landing_page.results.click
  expect(results_page).to have_heading
  expect(results_page).to_not have_no_hdf_message
  expect(results_page).to_not have_hdf_button
  expect(results_page).to have_ctf_download
  pupils_not_taking = []
  pupil_results = []
  results_page.results.pupil_list.map do |pupil|
    if pupil.score.text == '-'
      pupils_not_taking << {name: pupil.name.text, reason: pupil.status.text}
    else
      pupil_results << {id: SqlDbHelper.get_check_id_using_names(pupil.name.text.split(',')[0], pupil.name.text.split(',')[1].strip, @school_id)['id'].to_s, mark: pupil.score.text}
    end
  end
  db_pupil_results = checks_ids_from_school.map {|check| {id: check.to_s, mark: SqlDbHelper.get_check_result(check)['mark'].to_s}}.sort_by {|hsh| hsh[:id]}
  expect(db_pupil_results).to eql pupil_results.sort_by {|hsh| hsh[:id]}
  results_page.ctf_download.click
  ctf_path = File.expand_path("#{File.dirname(__FILE__)}/../../data/download/#{@school['dfeNumber']}_MTC_#{@school['dfeNumber']}_001.xml")
  wait_until(120,5){File.exist?(ctf_path)}
  ctf_file = File.read(ctf_path)
  @doc = Nokogiri::XML ctf_file
  pupil_results_with_code = pupils_not_taking.map {|pupil| {name: pupil[:name], mark: calculate_ctf_reason_code(pupil[:reason])}}
  pupil_results_with_mark = results_page.results.pupil_list.map {|pupil| ({name: pupil.name.text.split(',')[0] + ', ' + pupil.name.text.split(',')[0], mark: pupil.score.text}) unless pupil.score.text == '-'}.compact
  complete_results = (pupil_results_with_code + pupil_results_with_mark).sort_by {|hsh| hsh[:name]}
  ctf_results_hash = @doc.css('Pupil').map {|p| {name: p.children.css('Forename').text + ", " + p.children.css('Surname').text, mark: p.children.css('Result').text}}.sort_by {|hsh| hsh[:name]}
  expect(complete_results).to eql ctf_results_hash
end

Given(/^I have multiple pupils with no score or reason for not taking the check$/) do
  step 'I am logged in'
  step 'I am on the add multiple pupil page'
  step 'I Upload a valid CSV file to add Multiple Pupil'
end

When(/^a reason for not taking the check is applied to the pupils$/) do
  pupil_reason_page.load
  pupil_reason_page.attendance_codes.first.click
  pupil_reason_page.select_all_pupils.click
  pupil_reason_page.sticky_banner.confirm.click

end

Then('the HDF reflects these changes') do
  school_landing_page.load
  school_landing_page.hdf.click
  Timeout.timeout(120) {(visit current_url; sleep 2) until hdf_form_page.has_continue?}
  name = (0...8).map {(65 + rand(26)).chr}.join
  @hdf_details_hash = {first_name: name, last_name: name}
  hdf_form_page.enter_details(@hdf_details_hash)
  hdf_form_page.continue.click
  hdf_pupil_details = declaration_review_pupils_page.pupil_list.rows.map {|pupil| {:name => pupil.name.text, :status => pupil.reason.text}}
  hdf_pupil_details.each {|pupil| expect(pupil[:status]).to eql "Absent during check window"}
  declaration_review_pupils_page.continue_button.click
  declaration_confirm_page.submit_valid_confirmed
  expect(declaration_submitted_page).to be_displayed
  results_page.load
  results_details = results_page.results.pupil_list.map {|pupil| {:name => pupil.name.text, :status => pupil.status.text}}
  expect(hdf_pupil_details).to eql results_details
end

Then('the results reflect these changes') do
  results_page.ctf_download.click
  ctf_path = File.expand_path("#{File.dirname(__FILE__)}/../../data/download/#{@school['dfeNumber']}_MTC_#{@school['dfeNumber']}_001.xml")
  wait_until(120,5){File.exist?(ctf_path)}
  ctf_file = File.read(ctf_path)
  doc = Nokogiri::XML ctf_file
  pupils_not_taking = results_page.results.pupil_list.map {|pupil| {name: pupil.name.text, reason: pupil.status.text}}
  pupil_results_with_code = pupils_not_taking.map {|pupil| {name: pupil[:name].split(' ')[0] + ' ' +  pupil[:name].split(' ')[1], mark: calculate_ctf_reason_code(pupil[:reason])}}
  ctf_results_hash = doc.css('Pupil').map {|p| {name: p.children.css('Forename').text + ", " + p.children.css('Surname').text, mark: p.children.css('Result').text}}.sort_by {|hsh| hsh[:name]}
  expect(pupil_results_with_code).to eql ctf_results_hash
end

Then(/^I should see the version set to the current academic year$/) do
  expect(@doc.css('CTFversion').text).to eql(@academic_year - 1.year).strftime("%y.0")
end


Given(/^I download a ctf file in August$/) do
  step 'multiple pupils have completed the check'
  step 'some pupils who have been marked as not taking the check'
  step 'the data sync function has run'
  step 'we are in 1st week of check end date'
  step 'I have submitted the HDF'
  @check_window = SqlDbHelper.check_window_details('Development Phase')
  @original_check_start_date = @check_window['checkStartDate']
  @academic_year = Time.parse("31/08/#{Time.now.strftime("%Y")}")
  SqlDbHelper.update_check_window(@check_window['id'], 'checkStartDate', @academic_year.strftime("%Y-%m-%d %H:%M:%S.%LZ"))
  step 'I should see the results and reasons for not taking the check'
end


Given(/^I download a ctf file in September$/) do
  step 'multiple pupils have completed the check'
  step 'some pupils who have been marked as not taking the check'
  step 'the data sync function has run'
  step 'we are in 1st week of check end date'
  step 'I have submitted the HDF'
  @check_window = SqlDbHelper.check_window_details('Development Phase')
  @original_check_start_date = @check_window['checkStartDate']
  p @original_check_start_date
  @academic_year = Time.parse("1/09/#{Time.now.strftime("%Y")}")
  SqlDbHelper.update_check_window(@check_window['id'], 'checkStartDate', @academic_year.strftime("%Y-%m-%d %H:%M:%S.%LZ"))
  step 'I should see the results and reasons for not taking the check'
end

Then(/^I should see the version set to the correct academic year when downloaded in August$/) do
  expect(@doc.css('CTFversion').text).to eql (@academic_year - 1.year).strftime("%y.0")
end

Then(/^I should see the version set to the correct academic year when downloaded in September$/) do
  expect(@doc.css('CTFversion').text).to eql (@academic_year).strftime("%y.0")
end

Given(/^I have pupils have not completed a check and no reason for not taking the check$/) do
end

And(/^I should see their status set to Incomplete$/) do
  step "I am logged in"
  results_page.load
  statuses = results_page.results.pupil_list.map {|pupil| pupil.status.text}
  expect(statuses).to eql ["Incomplete", "Incomplete", "Incomplete", "Incomplete", "Incomplete"]
end

Given(/^I have a pupil who has the Not able to administer attendance code$/) do
  step 'I am on the school landing page for a school using an account with the sta admin role'
  step 'I should be able to add a pupil'
  pupils_not_taking_check_page.load
  pupils_not_taking_check_page.add_reason.click
  pupil_reason_page.select_reason('Not able to administer')
  @pupil_row = pupil_reason_page.pupil_list.rows.first
  @pupil_forename = @pupil_row.name.text.split(',')[1].strip
  @pupil_lastname = @pupil_row.name.text.split(',')[0].strip
  @pupil_row.checkbox.click
  pupil_reason_page.sticky_banner.confirm.click
end

Then(/^I should see the pupil has the Not able to administer attendance code$/) do
  checks_ids_from_school = SqlDbHelper.get_all_checks_from_school(@school_user['school_id']).map {|check| check['id']}
  checks_ids_from_school.each {|id| SqlDbHelper.wait_for_check_result(id)}
  school_landing_page.load
  wait_until(30,2){visit current_url; school_landing_page.has_results?}
  school_landing_page.results.click
  expect(results_page).to have_heading
  expect(results_page).to_not have_no_hdf_message
  expect(results_page).to_not have_hdf_button
  expect(results_page).to have_ctf_download
  @name = @details_hash[:first_name] + ', ' +@details_hash[:last_name]
  expect(results_page.results.pupil_list.find {|row| row.name.text == @name}.status.text).to eql 'Not able to administer'
  results_page.ctf_download.click
  ctf_path = File.expand_path("#{File.dirname(__FILE__)}/../../data/download/#{@school['dfeNumber']}_MTC_#{@school['dfeNumber']}_001.xml")
  wait_until(120,5){File.exist?(ctf_path)}
  ctf_file = File.read(ctf_path)
  doc = Nokogiri::XML ctf_file
  ctf_results_hash = doc.css('Pupil').map {|p| {name: p.children.css('Forename').text + ", " + p.children.css('Surname').text, mark: p.children.css('Result').text}}.sort_by {|hsh| hsh[:name]}
  pupil_result = ctf_results_hash.find{|h| h[:name].include? @name}
  expect(pupil_result[:mark]).to eql 'NAA'
end

Given(/^I have a pupil who has the Maladmin attendance code$/) do
  step 'the service manager has set a pupil to be annulled because of maladmin'
  visit ENV['ADMIN_BASE_URL'] + '/sign-out'
  step 'I am on the school landing page for a school using an account with the sta admin role'
end

Then(/^I should see the pupil has the Maladministration attendance code$/) do
  checks_ids_from_school = SqlDbHelper.get_all_checks_from_school(@school_user['school_id']).map {|check| check['id']}
  checks_ids_from_school.each {|id| SqlDbHelper.wait_for_check_result(id)}
  school_landing_page.load
  wait_until(30,2){visit current_url; school_landing_page.has_results?}
  school_landing_page.results.click
  expect(results_page).to have_heading
  expect(results_page).to_not have_no_hdf_message
  expect(results_page).to_not have_hdf_button
  expect(results_page).to have_ctf_download
  @name = @pupil_details["foreName"] + ', ' + @pupil_details['lastName']
  expect(results_page.results.pupil_list.find {|row| row.name.text == @name}.status.text).to eql 'Maladministration'
  results_page.ctf_download.click
  ctf_path = File.expand_path("#{File.dirname(__FILE__)}/../../data/download/#{@school['dfeNumber']}_MTC_#{@school['dfeNumber']}_001.xml")
  wait_until(120,5){File.exist?(ctf_path)}
  ctf_file = File.read(ctf_path)
  doc = Nokogiri::XML ctf_file
  ctf_results_hash = doc.css('Pupil').map {|p| {name: p.children.css('Forename').text + ", " + p.children.css('Surname').text, mark: p.children.css('Result').text}}.sort_by {|hsh| hsh[:name]}
  pupil_result = ctf_results_hash.find{|h| h[:name].include? @name}
  expect(pupil_result[:mark]).to eql 'Q'
end

Given(/^I have a pupil who has the Pupil cheating attendance code$/) do
  step 'the service manager has set a pupil to be annulled because of pupil_cheating'
  visit ENV['ADMIN_BASE_URL'] + '/sign-out'
  step 'I am on the school landing page for a school using an account with the sta admin role'
end

Then(/^I should see the pupil has the Pupil cheating attendance code$/) do
  checks_ids_from_school = SqlDbHelper.get_all_checks_from_school(@school_user['school_id']).map {|check| check['id']}
  checks_ids_from_school.each {|id| SqlDbHelper.wait_for_check_result(id)}
  school_landing_page.load
  wait_until(10,2){visit current_url; school_landing_page.has_results?}
  school_landing_page.results.click
  expect(results_page).to have_heading
  expect(results_page).to_not have_no_hdf_message
  expect(results_page).to_not have_hdf_button
  expect(results_page).to have_ctf_download
  @name = @pupil_details["foreName"] + ', ' + @pupil_details['lastName']
  expect(results_page.results.pupil_list.find {|row| row.name.text == @name}.status.text).to eql 'Pupil cheating'
  results_page.ctf_download.click
  ctf_path = File.expand_path("#{File.dirname(__FILE__)}/../../data/download/#{@school['dfeNumber']}_MTC_#{@school['dfeNumber']}_001.xml")
  wait_until(120,5){File.exist?(ctf_path)}
  ctf_file = File.read(ctf_path)
  doc = Nokogiri::XML ctf_file
  ctf_results_hash = doc.css('Pupil').map {|p| {name: p.children.css('Forename').text + ", " + p.children.css('Surname').text, mark: p.children.css('Result').text}}.sort_by {|hsh| hsh[:name]}
  pupil_result = ctf_results_hash.find{|h| h[:name].include? @name}
  expect(pupil_result[:mark]).to eql 'H'
end

And(/^the PS report should have the (.+) attendance code$/) do |attendance_code|
  response = FunctionsHelper.sync_all
  expect(response.code).to eql 202
  sleep 30
  urn = SqlDbHelper.find_school(@school_id)["urn"]
  visit ENV['ADMIN_BASE_URL'] + '/sign-out'
  visit ENV['ADMIN_BASE_URL']
  step 'I have signed in with tech-support'
  tech_support_page.run_ps_report.click
  run_ps_report_page.run_ps_report_for_school(urn)
  p "PS Report triggered at #{Time.now}"
  wait_until(300, 15) { SqlDbHelper.get_ps_report_job['jobStatus_id'] == 3 }
  p "PS Report completed at #{Time.now}"
  filename = JSON.parse(SqlDbHelper.get_ps_report_job['meta'])['filename']
  filename.slice!('ps-report-staging-')
  filename.slice!('.csv')
  ps_report_table_name = "psychometricReport_#{filename.gsub('-', '_')}"
  pupil_upn = @pupil_details['upn'] unless @pupil_details.nil?
  pupil_upn = @details_hash[:upn] unless @details_hash.nil?
  pupil_id = SqlDbHelper.pupil_details_using_school(pupil_upn, @school['id'])['id']
  ps_report_record = SqlDbHelper.get_ps_record_for_pupil(ps_report_table_name,pupil_id)
  case attendance_code
  when 'Pupil cheating'
    expected_code = 'H'
  when 'Maladministration'
    expected_code = 'Q'
  when 'Not able to administer'
    expected_code = 'NAA'
  else
    fail 'Attendance code not valid'
  end
  expect(ps_report_record['ReasonNotTakingCheck']).to eql expected_code
end
