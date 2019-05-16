Given(/^I have generated a pin via the admin app$/) do
  visit ENV['ADMIN_BASE_URL']
  # page.click_link('Sign out') if page.has_link?('Sign out')
  find('#username').set 'teacher1'
  find('#password').set 'password'
  find('input[value="Sign in"]').click
  visit ENV['ADMIN_BASE_URL']+'/pupil-pin/generate-live-pins-list'
  all('tbody tr').first.find('input[type="checkbox"]').click
  find('.sticky-banner-wrapper #stickyConfirm').click
  @school_password = all('.pin-content span:nth-child(2)').last.text
  @pupil_pin = all('.pin-content span:nth-child(5)').last.text
  AzureTableHelper.wait_for_prepared_check(@school_password,@pupil_pin)
end

Given(/^I make a request with valid credentials$/) do
  step 'I have generated a pin via the admin app'
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
  # expect(parsed_response['config']).to eql create_config_details_hash
  expect(parsed_response['tokens']['checkStarted']['url']).to include '/check-started'
  expect(parsed_response['tokens']['checkStarted']['token']).to_not be_nil
  expect(parsed_response['tokens']['pupilPreferences']['url']).to include '/pupil-prefs'
  expect(parsed_response['tokens']['pupilPreferences']['token']).to_not be_nil
  expect(parsed_response['tokens']['checkComplete']['url']).to include '/check-complete'
  expect(parsed_response['tokens']['checkComplete']['token']).to_not be_nil
  expect(parsed_response['tokens']['pupilFeedback']['url']).to include '/pupil-feedback'
  expect(parsed_response['tokens']['pupilFeedback']['token']).to_not be_nil
  expect(parsed_response['tokens']['jwt']['token']).to_not be_nil
end

Given(/^I make a request with invalid credentials$/) do
  @response = RequestHelper.auth('bac12345', '0000')
end

And(/^I should see a unauthorised response$/) do
  parsed_response = JSON.parse(@response.body)
  expect(parsed_response).to eql({"error"=>"Unauthorised"})
end

And(/^I should see the correct response headers$/) do
  expect(@response.headers['access-control-allow-origin']).to eql ENV['PUPIL_BASE_URL']
  expect(@response.headers['x-dns-prefetch-control']).to eql 'off'
  expect(@response.headers['x-frame-options']).to eql 'SAMEORIGIN'
  expect(@response.headers['strict-transport-security']).to eql 'max-age=31536000; includeSubDomains; preload'
  expect(@response.headers['x-download-options']).to eql 'noopen'
  expect(@response.headers['x-content-type-options']).to eql 'nosniff'
  expect(@response.headers['x-xss-protection']).to eql '1; mode=block'
  expect(@response.headers['content-type']).to eql 'application/json; charset=utf-8'
end
