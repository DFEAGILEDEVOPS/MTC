When(/^I inspect local storage$/) do
  storage1 = page.evaluate_script('window.localStorage;')
  storage_audit_keys = storage1.keys.select{|x| x.include?('audit')}
  @local_storage = []
  storage_audit_keys.each do |key|
    @local_storage << (JSON.parse page.evaluate_script("window.localStorage.getItem('#{key}');"))
  end
end


Then(/^all the events should be captured$/) do
  expect(@local_storage.find{|a| a['type'] == 'UtteranceEnded'}).to_not be_ni
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

  storage_school = JSON.parse page.evaluate_script('window.localStorage.getItem("school");')
  storage_pupil = JSON.parse page.evaluate_script('window.localStorage.getItem("pupil");')
  check_result = SqlDBHelper.wait_for_received_check(storage_pupil['checkCode'])
  check = JSON.parse(LZString::UTF16.decompress(check_result['archive']))
  local_storage = check['audit']

  expect(local_storage.first['type']).to eql 'WarmupStarted'
  expect(local_storage.last['type']).to eql 'CheckSubmissionApiCalled'
end
