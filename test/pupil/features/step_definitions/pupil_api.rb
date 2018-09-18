Given(/^I have generated a pin via the admin app$/) do
  visit 'http://localhost:3001'
  find('#username').set 'teacher1'
  find('#password').set 'password'
  find('input[value="Sign in"]').click
  visit 'http://localhost:3001/pupil-pin/generate-live-pins-list'
  all('tbody tr').first.find('input[type="checkbox"]').click
  find('.sticky-banner-wrapper #stickyConfirm').click
  @school_password = all('.pin-content span:nth-child(2)').last.text
  @pupil_pin = all('.pin-content span:nth-child(5)').last.text
end

Given(/^I make a request with valid credentials$/) do
  step 'I have generated a pin via the admin app'
  Timeout.timeout(60){sleep 1 until RequestHelper.auth(@school_password, @pupil_pin).code == 200}
  @response = RequestHelper.auth(@school_password, @pupil_pin)
end

Then(/^I should get a (\d+)$/) do |code|
  expect(@response.code).to eql code
end

And(/^I should see a valid response$/) do
  parsed_response = JSON.parse(@response.body)
  expect(parsed_response['questions'].size).to eql 10
  pupil_details = SqlDbHelper.find_pupil_via_pin(@pupil_pin)
  expect(parsed_response['pupil']).to eql create_pupil_details_hash(pupil_details)
  expect(parsed_response['school']).to eql create_school_details_hash(pupil_details['school_id'])
  expect(parsed_response['config']).to eql create_config_details_hash
  expect(parsed_response['tokens']['checkStarted']['url']).to eql 'https://strgt1dvmtcmq.queue.core.windows.net/check-started'
  expect(parsed_response['tokens']['checkStarted']['token']).to_not be_nil
  expect(parsed_response['tokens']['pupilPreferences']['url']).to eql 'https://strgt1dvmtcmq.queue.core.windows.net/pupil-prefs'
  expect(parsed_response['tokens']['pupilPreferences']['token']).to_not be_nil
  expect(parsed_response['tokens']['checkComplete']['url']).to eql 'https://strgt1dvmtcmq.queue.core.windows.net/check-complete'
  expect(parsed_response['tokens']['checkComplete']['token']).to_not be_nil
  expect(parsed_response['tokens']['pupilFeedback']['url']).to eql 'https://strgt1dvmtcmq.queue.core.windows.net/pupil-feedback'
  expect(parsed_response['tokens']['pupilFeedback']['token']).to_not be_nil
  expect(parsed_response['tokens']['jwt']['token']).to_not be_nil
end

Given(/^I make a request with invalid credentials$/) do
  @response = RequestHelper.auth('abc12345', '9999')
end

And(/^I should see a unauthorised response$/) do
  parsed_response = JSON.parse(@response.body)
  expect(parsed_response).to eql({"error"=>"Unauthorised"})
end