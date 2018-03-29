When(/^I inspect local storage$/) do
  @local_storage = JSON.parse(page.evaluate_script('window.localStorage.getItem("audit");'))
end


Then(/^all the events should be captured$/) do
  expect(@local_storage.first['type']).to eql 'WarmupStarted'
  @local_storage.shift
  expect(@local_storage.first['type']).to eql 'WarmupIntroRendered'
  @local_storage.reject!{|a| a['type'] == 'WarmupIntroRendered'}
  expect(@local_storage.find{|a| a['type'] == 'WarmupCompleteRendered'}).to_not be_nil
  @local_storage.reject!{|a| a['type'] == 'WarmupCompleteRendered'}
  expect(@local_storage.find{|a| a['type'] == 'CheckStarted'}).to_not be_nil
  @local_storage.reject!{|a| a['type'] == 'CheckStarted'}
  expect(@local_storage.find{|a| a['type'] == 'CheckStartedApiCalled'}).to_not be_nil
  @local_storage.reject!{|a| a['type'] == 'CheckStartedApiCalled'}
  expect(@local_storage.find{|a| a['type'] == 'CheckStartedAPICallSucceeded'}).to_not be_nil
  @local_storage.reject!{|a| a['type'] == 'CheckStartedAPICallSucceeded'}
  @last = @local_storage.pop(1)[0]
  expect(@last['type']).to eql 'CheckComplete'
  @local_storage.each_slice(3) do |slice|
    if !((slice[0]['type'].eql?('CheckSubmissionPending')) || (slice[1]['type'].eql?('CheckSubmissionAPICallSucceeded')) || (slice[2]['type'].eql?('CheckSubmissionApiCalled')))
      expect(slice[0]['type']).to eql 'PauseRendered'
      expect(slice[1]['type']).to eql 'QuestionRendered'
      expect(slice[2]['type']).to eql 'QuestionAnswered'
      expect((Time.parse(slice[1]['clientTimestamp'])-Time.parse(slice[0]['clientTimestamp'])).to_i).to eql 2
    end

  end
end
