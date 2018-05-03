Then(/^I should see device information populated in local storage$/) do
  device_info = JSON.parse(page.evaluate_script('window.localStorage.getItem("device");'))
  expect(device_info['battery'].keys).to eql ["isCharging", "levelPercent", "chargingTime", "dischargingTime"]
  expect(device_info['cpu'].keys).to eql ["hardwareConcurrency"]
  expect(device_info['navigator'].keys).to eql ["userAgent", "platform", "language", "cookieEnabled", "doNotTrack"]
  expect(device_info['networkConnection'].keys).to eql ["downlink", "effectiveType", "rtt"]
  expect(device_info['screen'].keys).to eql ["screenWidth", "screenHeight", "outerWidth", "outerHeight", "innerWidth", "innerHeight", "colorDepth", "orientation"]
end

Then(/^the device information should be persisted to the DB$/) do
  device_info = JSON.parse(page.evaluate_script('window.localStorage.getItem("device");'))
  check_code = JSON.parse(page.evaluate_script('window.localStorage.getItem("pupil");'))['checkCode']
  data = SqlDbHelper.get_check_data(check_code)
  local_info = JSON.parse data['data']
  db_device_info = local_info['data']['device']
  expect(db_device_info).to eql device_info
end