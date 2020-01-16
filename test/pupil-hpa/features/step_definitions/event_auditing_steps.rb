When(/^I inspect local storage$/) do
  storage1 = page.evaluate_script('window.localStorage;')
  storage_audit_keys = storage1.keys.select{|x| x.include?('audit')}
  @local_storage = []
  storage_audit_keys.each do |key|
    @local_storage << (JSON.parse page.evaluate_script("window.localStorage.getItem('#{key}');"))
  end
end


Then(/^all the events should be captured$/) do
  expect(@local_storage.find{|a| a['type'] == 'UtteranceEnded'}).to_not be_nil
  expect(@local_storage.find{|a| a['type'] == 'WarmupStarted'}).to_not be_nil
  expect(@local_storage.find{|a| a['type'] == 'WarmupIntroRendered'}).to_not be_nil
  @local_storage.reject!{|a| a['type'] == 'WarmupIntroRendered'}
  expect(@local_storage.find{|a| a['type'] == 'WarmupCompleteRendered'}).to_not be_nil
  @local_storage.reject!{|a| a['type'] == 'WarmupCompleteRendered'}
  expect(@local_storage.find{|a| a['type'] == 'QuestionIntroRendered'}).to_not be_nil
  @local_storage.reject!{|a| a['type'] == 'QuestionIntroRendered'}
  expect(@local_storage.find{|a| a['type'] == 'CheckStarted'}).to_not be_nil
  @local_storage.reject!{|a| a['type'] == 'CheckStarted'}
  expect(@local_storage.find{|a| a['type'] == 'CheckStartedApiCalled'}).to_not be_nil
  @local_storage.reject!{|a| a['type'] == 'CheckStartedApiCalled'}
  expect(@local_storage.find{|a| a['type'] == 'CheckStartedAPICallSucceeded'}).to_not be_nil
  @local_storage.reject!{|a| a['type'] == 'CheckStartedAPICallSucceeded'}
  expect(@local_storage.find{|a| a['type'] == 'CheckSubmissionAPICallSucceeded'}).to_not be_nil

  storage_pupil = JSON.parse page.evaluate_script('window.localStorage.getItem("pupil");')
  wait_until(120,5){SqlDbHelper.get_check(storage_pupil['checkCode'])}
  pupil_check = SqlDbHelper.get_check(storage_pupil['checkCode'])
  wait_until(240,5){SqlDbHelper.get_check_result(pupil_check['id'])}
  check_result = SqlDbHelper.get_check_result(pupil_check['id'])
  check = JSON.parse(check_result['payload'])
  local_storage = check['audit']

  expect(local_storage.first['type']).to eql 'WarmupStarted'
  expect(local_storage.last['type']).to eql 'CheckSubmissionApiCalled'
end
