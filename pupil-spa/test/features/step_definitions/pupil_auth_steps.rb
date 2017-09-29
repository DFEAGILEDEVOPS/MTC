Then(/^I should see meta data stored in the DB$/) do
  current_time = Time.now
  wait_until {page.evaluate_script('window.localStorage.getItem("pupil");')}
  storage_pupil = JSON.parse page.evaluate_script('window.localStorage.getItem("pupil");')
  stored_check = MongoDbHelper.get_pupil_check_metadata(storage_pupil['checkCode'])
  expect(stored_check['updatedAt'].strftime('%d-%m-%y %H:%M')).to eql current_time.utc.strftime('%d-%m-%y %H:%M')
  expect(stored_check['createdAt'].strftime('%d-%m-%y %H:%M')).to eql current_time.utc.strftime('%d-%m-%y %H:%M')
  expect(stored_check['pupilId']).to eql @pupil_information['_id']
  check_window_id = stored_check['checkWindowId'].to_s
  MongoDbHelper.get_check_window(check_window_id)
  expect(MongoDbHelper.get_check_window(check_window_id)['startDate'] < current_time).to be_truthy
  expect(MongoDbHelper.get_check_window(check_window_id)['endDate'] > current_time).to be_truthy
  questions_recieved = JSON.parse page.evaluate_script('window.localStorage.getItem("questions");')
  questions_expected = MongoDbHelper.get_form(100)['questions']
  expect(questions_expected).to eql questions_recieved.map{|b| {'f1' => b['factor1'], 'f2' =>  b['factor2']}}
  expect(stored_check['pupilLoginDate'].strftime('%d-%m-%y %H:%M')).to eql current_time.utc.strftime('%d-%m-%y %H:%M')
end

Given(/^I have failed to login$/) do
  @checks_count = MongoDbHelper.number_of_checks
  step "I have attempted to enter a school I do not attend upon login"
end

Then(/^I should see no pupil metadata stored$/) do
  expect(@checks_count).to eql MongoDbHelper.number_of_checks
end

Given(/^I attempt to login whilst the check window is not open as the end date is in the past$/) do
  original = MongoDbHelper.get_check_window_via_name('Summer 2017')
  @original_date_time = {endDate: original['endDate']}
  updated = original.each{ |key,str| original['endDate'] = Time.now - 60}
  collection=CLIENT[:checkwindows]
  collection.update_one({'_id' => original['_id']}, updated)
  step 'I have logged in'
end

Given(/^I attempt to login whilst the check window is not open as the start date is in the future$/) do
  original = MongoDbHelper.get_check_window_via_name('Summer 2017')
  @original_date_time = {startDate: original['startDate']}
  updated = original.each{ |key,str| original['startDate'] = Time.now + 60}
  collection=CLIENT[:checkwindows]
  collection.update_one({'_id' => original['_id']}, updated)
  step 'I have logged in'
end
