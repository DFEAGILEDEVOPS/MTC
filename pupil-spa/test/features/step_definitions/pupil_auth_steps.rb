Then(/^I should see meta data stored in the DB$/) do
  current_time = Time.now
  wait_until {page.evaluate_script('window.localStorage.getItem("pupil");')}
  storage_pupil = JSON.parse page.evaluate_script('window.localStorage.getItem("pupil");')
  stored_check = SqlDbHelper.get_pupil_check_metadata(storage_pupil['checkCode'])
  expect(stored_check['updatedAt'].strftime('%d-%m-%y %H:%M')).to eql current_time.utc.strftime('%d-%m-%y %H:%M')
  expect(stored_check['createdAt'].strftime('%d-%m-%y %H:%M')).to eql current_time.utc.strftime('%d-%m-%y %H:%M')
  expect(stored_check['pupil_id']).to eql @pupil_information['id']
  check_window_id = stored_check['checkWindow_id'].to_s
  SqlDbHelper.get_check_window(check_window_id)
  expect(SqlDbHelper.get_check_window(check_window_id)['checkStartDate'] < current_time).to be_truthy
  expect(SqlDbHelper.get_check_window(check_window_id)['checkEndDate'] > current_time).to be_truthy
  questions_recieved = JSON.parse page.evaluate_script('window.localStorage.getItem("questions");')
  questions_expected = SqlDbHelper.get_form(1)['formData']
  q_data = JSON.parse(questions_expected.gsub("\n", "").gsub("        ", "").gsub("    ", ""))
  expect(q_data).to eql questions_recieved.map{|b| {'f1' => b['factor1'], 'f2' =>  b['factor2']}}
  expect(stored_check['pupilLoginDate'].strftime('%d-%m-%y %H:%M')).to eql current_time.utc.strftime('%d-%m-%y %H:%M')
end

Given(/^I have failed to login$/) do
  @checks_count = SqlDbHelper.number_of_checks
  step "I have attempted to enter a school I do not attend upon login"
end

Then(/^I should see no pupil metadata stored$/) do
  expect(@checks_count).to eql SqlDbHelper.number_of_checks
end

Given(/^I attempt to login whilst the check window is not open as the end date is in the past$/) do
  original = SqlDbHelper.get_check_window_via_name('Development Phase')
  @original_date_time = {endDate: original['checkEndDate']}
  check_end_date = (Time.now - 60).strftime("%Y-%m-%d %H:%M:%S.%LZ")
  SqlDbHelper.update_check_window(original['id'], 'checkEndDate', check_end_date)

  step 'I have logged in'
end

Given(/^I attempt to login whilst the check window is not open as the start date is in the future$/) do
  original = SqlDbHelper.get_check_window_via_name('Development Phase')
  @original_date_time = {startDate: original['checkStartDate']}
  check_start_date = (Time.now + 24*60*60).strftime("%Y-%m-%d %H:%M:%S.%LZ")
  SqlDbHelper.update_check_window(original['id'], 'checkStartDate', check_start_date)

  step 'I have logged in'
end
