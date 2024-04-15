Then(/^I should see no device cookie$/) do
  expect(Capybara.current_session.driver.browser.manage.all_cookies.map {|cookie| cookie[:name]}).to_not include 'mtc_device'
end

Then(/^I should see a device cookie has been created$/) do
  expect(confirmation_page).to be_displayed
  mtc_device_cookie = Capybara.current_session.driver.browser.manage.cookie_named('mtc_device')
  expect(mtc_device_cookie).to_not be_nil
  expect((mtc_device_cookie[:expires] - Date.today).to_i).to eql 28
  expect(mtc_device_cookie[:value]).to_not be nil
end

When(/^the data sync function has run$/) do
  # (wait_until(ENV['WAIT_TIME'].to_i,2){SqlDbHelper.get_check(@check_code)['complete'] == true}) unless @check_code.nil?
  response = FunctionsHelper.sync_all
  expect(response.code).to eql 202
  sleep 300
end

Then(/^the device cookie is stored$/) do
  mtc_device_cookie = Capybara.current_session.driver.browser.manage.cookie_named('mtc_device')
  Timeout.timeout(ENV['WAIT_TIME'].to_i){sleep 3 until SqlDbHelper.get_device_information(mtc_device_cookie[:value]) != nil }
  db_device_info = SqlDbHelper.get_device_information(mtc_device_cookie[:value])
  expect(db_device_info).to_not be_nil
end
