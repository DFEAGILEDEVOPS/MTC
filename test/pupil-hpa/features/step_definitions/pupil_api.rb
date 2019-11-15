Given(/^I have generated a pin via the admin app$/) do
  visit ENV['ADMIN_BASE_URL']
  # page.click_link('Sign out') if page.has_link?('Sign out')
  find('#username').set 'teacher1'
  find('#password').set 'password'
  find('button[type="submit"]').click
  visit ENV['ADMIN_BASE_URL']+'/pupil-pin/generate-live-pins-list'
  pupil_name = generate_pins_overview_page.pupil_list.rows.first.name.text
  generate_pins_overview_page.pupil_list.rows.first.checkbox.click
  generate_pins_overview_page.sticky_banner.confirm.click
  @school_password = view_and_custom_print_live_check_page.find_pupil_row(pupil_name).school_password.text
  @pupil_pin = view_and_custom_print_live_check_page.find_pupil_row(pupil_name).pin.text
  AzureTableHelper.wait_for_prepared_check(@school_password,@pupil_pin)
end

Given(/^I make a request with valid credentials$/) do
  step 'I have generated a live pin'
  @response = RequestHelper.auth(@pupil_credentials[:school_password], @pupil_credentials[:pin])
end

Then(/^I should get a (\d+)$/) do |code|
  expect(@response.code).to eql code
end

And(/^I should see a valid response$/) do
  parsed_response = JSON.parse(@response.body)
  expect(parsed_response['questions'].size).to eql 25
  pupil_details = SqlDbHelper.find_pupil_via_pin(@pupil_credentials[:pin])
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


Given(/^I have generated a pin for a pupil$/) do
  step 'I add a pupil'
  step 'I login to the admin app with teacher1'
  visit ENV['ADMIN_BASE_URL'] + generate_pins_overview_page.url
  generate_pins_overview_page.generate_pin_using_name(@details_hash[:last_name] + ', ' + @details_hash[:first_name])
  pupil_pin_row = view_and_custom_print_live_check_page.pupil_list.rows.find {|row| row.name.text == @details_hash[:last_name] + ', ' + @details_hash[:first_name]}
  @pupil_credentials = {:school_password => pupil_pin_row.school_password.text, :pin => pupil_pin_row.pin.text}
  @before_login = REDIS_CLIENT.ttl("preparedCheck:#{@pupil_credentials[:school_password]}:#{@pupil_credentials[:pin]}")
end


When(/^I make a request to login$/) do
  @response = RequestHelper.auth(@pupil_credentials[:school_password], @pupil_credentials[:pin])
  @after_login = REDIS_CLIENT.ttl("preparedCheck:#{@pupil_credentials[:school_password]}:#{@pupil_credentials[:pin]}")
end

Then(/^I should see the expiry time change to (\d+) minutes$/) do |value|
  expect(@before_login).to be > value.to_i
  expect(@after_login/60).to be <= value.to_i
  expect(@after_login/60).to be > value.to_i - 3
end
